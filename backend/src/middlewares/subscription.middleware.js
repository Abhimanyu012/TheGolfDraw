import { desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { subscriptions } from "../db/schema.js";
import { ApiError } from "../utils/http.js";

export const requireActiveSubscription = async (req, res, next) => {
  try {
    const active =
      req.subscription ||
      (await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, req.user.id),
        orderBy: [desc(subscriptions.createdAt)],
      }));

    if (!active || active.status !== "ACTIVE") {
      throw new ApiError(403, "Active subscription required");
    }

    req.subscription = active;
    next();
  } catch (error) {
    next(error);
  }
};
