import { randomUUID } from "crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/db.js";
import { draws, scores, subscriptions, users, winners } from "../db/schema.js";
import { buildDrawNumbers, countMatches, getTierFromMatches } from "../utils/draw.js";
import { POOL_SHARES, PRIZE_POOL_PERCENT } from "../utils/constants.js";

export const getMonthYear = ({ month, year }) => {
  const now = new Date();
  return {
    month: month || now.getUTCMonth() + 1,
    year: year || now.getUTCFullYear(),
  };
};

export const getActiveSubscribersWithScores = async () => {
  const subs = await db
    .select({ userId: subscriptions.userId, amountCents: subscriptions.amountCents })
    .from(subscriptions)
    .where(eq(subscriptions.status, "ACTIVE"));

  if (subs.length === 0) return [];

  const userIds = subs.map((s) => s.userId);

  // Fetch all scores in a single query to fix N+1 issue
  const allUserScores = await db
    .select({ userId: scores.userId, value: scores.value, date: scores.date })
    .from(scores)
    .where(inArray(scores.userId, userIds))
    .orderBy(desc(scores.date));

  const userScoresMap = {};
  for (const score of allUserScores) {
    if (!userScoresMap[score.userId]) {
      userScoresMap[score.userId] = [];
    }
    if (userScoresMap[score.userId].length < 5) {
      userScoresMap[score.userId].push(score.value);
    }
  }

  return subs.map((sub) => ({
    userId: sub.userId,
    amountCents: sub.amountCents,
    scores: userScoresMap[sub.userId] || [],
  }));
};

export const runDrawEngine = async ({ logic, carryInCents }) => {
  const activeUsers = await getActiveSubscribersWithScores();
  
  const eligibleUsers = activeUsers.filter((u) => u.scores.length === 5);

  if (eligibleUsers.length === 0) {
    const err = new Error("No eligible users with 5 scores and active subscription");
    err.statusCode = 400;
    throw err;
  }

  const allScores = eligibleUsers.flatMap((u) => u.scores);
  const numbers = buildDrawNumbers({ logic, allScores });

  const totalSubscriptionCents = activeUsers.reduce((acc, s) => acc + s.amountCents, 0);
  const totalPoolCents = Math.floor(totalSubscriptionCents * PRIZE_POOL_PERCENT);
  const pool5Cents = Math.floor(totalPoolCents * POOL_SHARES.FIVE);
  const pool4Cents = Math.floor(totalPoolCents * POOL_SHARES.FOUR);
  const pool3Cents = totalPoolCents - pool5Cents - pool4Cents;

  const result = {
    numbers,
    totalPoolCents,
    pool5Cents,
    pool4Cents,
    pool3Cents,
    jackpotCarryInCents: carryInCents,
    jackpotCarryOutCents: 0,
    winners: [],
  };

  for (const user of eligibleUsers) {
    const matchCount = countMatches(user.scores, numbers);
    const tier = getTierFromMatches(matchCount);

    if (!tier) continue;

    result.winners.push({
      userId: user.userId,
      matchCount,
      tier,
    });
  }

  const winnersByTier = {
    FIVE: result.winners.filter((w) => w.tier === "FIVE"),
    FOUR: result.winners.filter((w) => w.tier === "FOUR"),
    THREE: result.winners.filter((w) => w.tier === "THREE"),
  };

  const tier5Distributable = pool5Cents + carryInCents;

  if (winnersByTier.FIVE.length === 0) {
    result.jackpotCarryOutCents = tier5Distributable;
  }

  const payouts = {
    FIVE: winnersByTier.FIVE.length > 0 ? Math.floor(tier5Distributable / winnersByTier.FIVE.length) : 0,
    FOUR: winnersByTier.FOUR.length > 0 ? Math.floor(pool4Cents / winnersByTier.FOUR.length) : 0,
    THREE: winnersByTier.THREE.length > 0 ? Math.floor(pool3Cents / winnersByTier.THREE.length) : 0,
  };

  result.winners = result.winners.map((w) => ({
    ...w,
    amountCents: payouts[w.tier],
  }));

  return result;
};
