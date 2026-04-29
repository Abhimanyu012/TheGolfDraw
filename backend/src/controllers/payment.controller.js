import crypto from "crypto";
import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { charities, donations, subscriptions } from "../db/schema.js";
import { PLAN_PRICES_CENTS } from "../utils/constants.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import {
  createRazorpayOrder,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  getRazorpayPublicKey,
} from "../services/razorpay.service.js";

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const verifySignature = ({ orderId, paymentId, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new ApiError(500, "Razorpay secret is not configured");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
};

const findCharityForSubscriptionDonation = async () => {
  const [featured] = await db
    .select({ id: charities.id })
    .from(charities)
    .where(eq(charities.isActive, true))
    .orderBy(desc(charities.isFeatured), desc(charities.createdAt))
    .limit(1);

  return featured ?? null;
};

export const createSubscriptionOrder = asyncHandler(async (req, res) => {
  const { plan } = req.body;

  if (!plan || !PLAN_PRICES_CENTS[plan]) {
    throw new ApiError(400, "Valid plan is required (MONTHLY or YEARLY)");
  }

  const amountCents = PLAN_PRICES_CENTS[plan];
  const receipt = `sub_${req.user.id.slice(0, 8)}_${Date.now()}`;

  const order = await createRazorpayOrder({
    amountCents,
    currency: "INR",
    receipt,
    notes: {
      userId: req.user.id,
      plan,
      purpose: "SUBSCRIPTION",
    },
  });

  res.status(201).json({
    success: true,
    order: {
      razorpayOrderId: order.id,
      amountCents: order.amount,
      currency: order.currency,
      plan,
      keyId: getRazorpayPublicKey(),
    },
  });
});

export const verifySubscriptionPayment = asyncHandler(async (req, res) => {
  const {
    plan,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = req.body;

  if (!plan || !PLAN_PRICES_CENTS[plan]) {
    throw new ApiError(400, "Valid plan is required (MONTHLY or YEARLY)");
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "razorpay_order_id, razorpay_payment_id and razorpay_signature are required");
  }

  const isValidSignature = verifySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValidSignature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const [latestSubscription] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, req.user.id), eq(subscriptions.status, "ACTIVE")))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  const now = new Date();
  if (
    latestSubscription &&
    latestSubscription.plan === plan &&
    latestSubscription.amountCents === PLAN_PRICES_CENTS[plan] &&
    now.getTime() - new Date(latestSubscription.createdAt).getTime() < 15 * 60 * 1000
  ) {
    return res.json({ success: true, subscription: latestSubscription, duplicate: true });
  }

  const order = await fetchRazorpayOrder(razorpayOrderId);
  const payment = await fetchRazorpayPayment(razorpayPaymentId);

  const expectedAmount = PLAN_PRICES_CENTS[plan];
  if (order.amount !== expectedAmount || payment.amount !== expectedAmount) {
    throw new ApiError(400, "Payment amount mismatch");
  }

  if (payment.status !== "captured" && payment.status !== "authorized") {
    throw new ApiError(400, "Payment is not successful");
  }

  if (latestSubscription) {
    await db
      .update(subscriptions)
      .set({
        status: "CANCELED",
        endsAt: now,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, latestSubscription.id));
  }

  const renewsAt = plan === "MONTHLY" ? addMonths(now, 1) : addMonths(now, 12);
  const [subscription] = await db
    .insert(subscriptions)
    .values({
      id: randomUUID(),
      userId: req.user.id,
      plan,
      status: "ACTIVE",
      amountCents: expectedAmount,
      startsAt: now,
      renewsAt,
    })
    .returning();

  const charity = await findCharityForSubscriptionDonation();
  if (charity) {
    const donationAmountCents = Math.floor(expectedAmount * 0.1);
    await db.insert(donations).values({
      id: randomUUID(),
      userId: req.user.id,
      charityId: charity.id,
      amountCents: donationAmountCents,
      source: "SUBSCRIPTION",
    });
  }

  res.json({
    success: true,
    subscription,
    payment: {
      razorpayOrderId,
      razorpayPaymentId,
      status: payment.status,
    },
  });
});
