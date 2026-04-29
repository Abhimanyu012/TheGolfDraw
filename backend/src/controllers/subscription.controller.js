import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { donations, subscriptions, users } from "../db/schema.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { PLAN_PRICES_CENTS } from "../utils/constants.js";

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export const upsertSubscription = asyncHandler(async (req, res) => {
  const { plan } = req.body;

  if (!plan || !PLAN_PRICES_CENTS[plan]) {
    throw new ApiError(400, "Valid plan is required (MONTHLY or YEARLY)");
  }

  const now = new Date();
  const renewsAt = plan === "MONTHLY" ? addMonths(now, 1) : addMonths(now, 12);

  const [user] = await db
    .select({
      selectedCharityId: users.selectedCharityId,
      charityContributionPercentage: users.charityContributionPercentage,
    })
    .from(users)
    .where(eq(users.id, req.user.id))
    .limit(1);

  if (!user?.selectedCharityId) {
    throw new ApiError(400, "User must select a charity before activating subscription");
  }

  const amountCents = PLAN_PRICES_CENTS[plan];

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      id: randomUUID(),
      userId: req.user.id,
      plan,
      status: "ACTIVE",
      amountCents,
      startsAt: now,
      renewsAt,
    })
    .returning();

  const donationAmountCents = Math.floor((amountCents * (user.charityContributionPercentage ?? 10)) / 100);

  await db.insert(donations).values({
      id: randomUUID(),
      userId: req.user.id,
      charityId: user.selectedCharityId,
      amountCents: donationAmountCents,
      source: "SUBSCRIPTION",
  });

  res.status(201).json({ success: true, subscription });
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const active = await db.query.subscriptions.findFirst({
    where: and(eq(subscriptions.userId, req.user.id), eq(subscriptions.status, "ACTIVE")),
    orderBy: [desc(subscriptions.createdAt)],
  });

  if (!active) {
    throw new ApiError(404, "No active subscription found");
  }

  const [subscription] = await db
    .update(subscriptions)
    .set({
      status: "CANCELED",
      endsAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, active.id))
    .returning();

  res.json({ success: true, subscription });
});

export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, req.user.id),
    orderBy: [desc(subscriptions.createdAt)],
  });

  res.json({ success: true, subscription });
});
