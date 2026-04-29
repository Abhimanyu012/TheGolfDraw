import { randomUUID } from "crypto";
import { and, desc, eq, notInArray } from "drizzle-orm";
import { db } from "../db/db.js";
import { scores } from "../db/schema.js";

export const validateScore = (value) => Number.isInteger(value) && value >= 1 && value <= 45;

export const parseDateOnly = (input) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const addScoreAtomic = async (userId, value, normalizedDate) => {
  return await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: scores.id })
      .from(scores)
      .where(and(eq(scores.userId, userId), eq(scores.date, normalizedDate)))
      .limit(1);

    if (existing) {
      const err = new Error("A score already exists for this date. Edit or delete it instead.");
      err.statusCode = 409;
      throw err;
    }

    const [score] = await tx
      .insert(scores)
      .values({
        id: randomUUID(),
        userId,
        value,
        date: normalizedDate,
      })
      .returning();

    const topScores = await tx
      .select({ id: scores.id })
      .from(scores)
      .where(eq(scores.userId, userId))
      .orderBy(desc(scores.date))
      .limit(5);

    const topScoreIds = topScores.map(s => s.id);

    if (topScoreIds.length > 0) {
      await tx
        .delete(scores)
        .where(and(eq(scores.userId, userId), notInArray(scores.id, topScoreIds)));
    }

    return score;
  });
};
