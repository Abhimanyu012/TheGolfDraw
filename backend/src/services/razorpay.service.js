import Razorpay from "razorpay";
import { ApiError } from "../utils/http.js";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayClient = null;

const getClient = () => {
  if (!keyId || !keySecret) {
    throw new ApiError(500, "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
};

export const createRazorpayOrder = async ({ amountCents, currency = "INR", receipt, notes = {} }) => {
  const client = getClient();
  return client.orders.create({
    amount: amountCents,
    currency,
    receipt,
    notes,
  });
};

export const fetchRazorpayOrder = async (razorpayOrderId) => {
  const client = getClient();
  return client.orders.fetch(razorpayOrderId);
};

export const fetchRazorpayPayment = async (razorpayPaymentId) => {
  const client = getClient();
  return client.payments.fetch(razorpayPaymentId);
};

export const getRazorpayPublicKey = () => {
  if (!keyId) {
    throw new ApiError(500, "Razorpay public key is not configured");
  }

  return keyId;
};
