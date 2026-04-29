import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/http.js";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { subscriptions, users } from "../db/schema.js";

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new ApiError(401, "Authorization token missing");
    }

    const token = header.split(" ")[1];
    const payload = verifyToken(token);

    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        fullName: users.fullName,
      })
      .from(users)
      .where(eq(users.id, payload.userId));

    const user = userList[0];

    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    const [latestSubscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    let effectiveSubscription = latestSubscription;

    if (
      latestSubscription &&
      latestSubscription.status === "ACTIVE" &&
      latestSubscription.renewsAt < new Date()
    ) {
      // Avoid mutating the database in middleware. 
      // A cron job should handle this, but for this request, treat it as lapsed.
      effectiveSubscription = { ...latestSubscription, status: "LAPSED" };
    }

    req.user = user;
    req.subscription = effectiveSubscription;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, "Unauthorized"));
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      req.user = null;
      req.subscription = null;
      next();
      return;
    }

    const token = header.split(" ")[1];
    const payload = verifyToken(token);

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        fullName: users.fullName,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      req.user = null;
      req.subscription = null;
      next();
      return;
    }

    req.user = user;
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    req.subscription = subscription;

    next();
  } catch (error) {
    req.user = null;
    req.subscription = null;
    next();
  }
};
