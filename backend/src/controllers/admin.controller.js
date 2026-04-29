import { and, count, desc, eq, ilike, or, sum } from "drizzle-orm";
import { db } from "../db/db.js";
import { charities, donations, draws, scores, subscriptions, users, winners } from "../db/schema.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { sendBulkEmail } from "../utils/email.js";
import { broadcastTemplate } from "../utils/templates.js";

export const listUsers = asyncHandler(async (req, res) => {
  const q = req.query.q?.toString().trim();
  const condition = q
    ? or(ilike(users.fullName, `%${q}%`), ilike(users.email, `%${q}%`))
    : undefined;

  const userList = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      charityContributionPercent: users.charityContributionPercentage,
      selectedCharityId: users.selectedCharityId,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(condition)
    .orderBy(desc(users.createdAt));

  const result = await Promise.all(
    userList.map(async (u) => {
      const [latestSub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, u.id))
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);
      const [charity] = await db
        .select({ id: charities.id, name: charities.name })
        .from(charities)
        .where(eq(charities.id, u.selectedCharityId))
        .limit(1);
      return { ...u, selectedCharity: charity, subscriptions: latestSub ? [latestSub] : [] };
    })
  );

  res.json({ success: true, users: result });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { fullName, role, charityContributionPercent, selectedCharityId } = req.body;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existing) {
    throw new ApiError(404, "User not found");
  }

  if (charityContributionPercent !== undefined && (charityContributionPercent < 10 || charityContributionPercent > 100)) {
    throw new ApiError(400, "charityContributionPercent must be between 10 and 100");
  }

  const [updated] = await db
    .update(users)
    .set({
      fullName: fullName ?? existing.fullName,
      role: role ?? existing.role,
      charityContributionPercentage: charityContributionPercent ?? existing.charityContributionPercentage,
      selectedCharityId: selectedCharityId ?? existing.selectedCharityId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  res.json({ success: true, user: updated });
});

export const listSubscriptions = asyncHandler(async (req, res) => {
  const status = req.query.status?.toString();
  const condition = status ? eq(subscriptions.status, status) : undefined;

  const subList = await db
    .select()
    .from(subscriptions)
    .leftJoin(users, eq(subscriptions.userId, users.id))
    .where(condition)
    .orderBy(desc(subscriptions.createdAt));

  const result = subList.map((s) => ({
    ...s.subscriptions,
    user: { id: s.users?.id, fullName: s.users?.fullName, email: s.users?.email },
  }));

  res.json({ success: true, subscriptions: result });
});

export const updateSubscriptionStatus = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { status } = req.body;

  if (!["ACTIVE", "INACTIVE", "CANCELED", "LAPSED"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1);

  if (!existing) {
    throw new ApiError(404, "Subscription not found");
  }

  const [subscription] = await db
    .update(subscriptions)
    .set({
      status,
      endsAt: status === "CANCELED" || status === "LAPSED" ? new Date() : existing.endsAt,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscriptionId))
    .returning();

  res.json({ success: true, subscription });
});

export const listUserScores = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const scoreList = await db
    .select()
    .from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.date));

  res.json({ success: true, scores: scoreList });
});

export const updateUserScore = asyncHandler(async (req, res) => {
  const { userId, scoreId } = req.params;
  const { value } = req.body;

  if (!Number.isInteger(value) || value < 1 || value > 45) {
    throw new ApiError(400, "Score must be integer between 1 and 45");
  }

  const [existing] = await db
    .select()
    .from(scores)
    .where(and(eq(scores.id, scoreId), eq(scores.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new ApiError(404, "Score not found for user");
  }

  const [updated] = await db
    .update(scores)
    .set({ value, updatedAt: new Date() })
    .where(eq(scores.id, scoreId))
    .returning();

  res.json({ success: true, score: updated });
});

export const listDonations = asyncHandler(async (req, res) => {
  const donationList = await db
    .select()
    .from(donations)
    .leftJoin(users, eq(donations.userId, users.id))
    .leftJoin(charities, eq(donations.charityId, charities.id))
    .orderBy(desc(donations.createdAt));

  const result = donationList.map((d) => ({
    ...d.donations,
    user: { id: d.users?.id, email: d.users?.email, fullName: d.users?.fullName },
    charity: { id: d.charities?.id, name: d.charities?.name, slug: d.charities?.slug },
  }));

  res.json({ success: true, donations: result });
});

export const broadcastSystemUpdate = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    throw new ApiError(400, "subject and message are required");
  }

  const userList = await db
    .select({ email: users.email, fullName: users.fullName })
    .from(users);

  const recipients = userList.map((u) => u.email);
  const result = await sendBulkEmail({
    recipients,
    subject,
    htmlBuilder: (to) => {
      const person = userList.find((u) => u.email === to);
      const name = person?.fullName || "Subscriber";
      return broadcastTemplate({
        fullName: name,
        subject,
        message,
        actionUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`
      });
    },
  });

  res.json({ success: true, result });
});
