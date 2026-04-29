import { randomUUID } from "crypto";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { scores } from "../db/schema.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { addScoreAtomic, parseDateOnly, validateScore } from "../services/score.service.js";

export const addScore = asyncHandler(async (req, res) => {
  const { value, date } = req.body;

  if (!validateScore(value)) {
    throw new ApiError(400, "Score must be an integer between 1 and 45");
  }

  const normalizedDate = parseDateOnly(date);

  if (!normalizedDate) {
    throw new ApiError(400, "Valid score date is required");
  }

  try {
    const score = await addScoreAtomic(req.user.id, value, normalizedDate);
    res.status(201).json({ success: true, score });
  } catch (err) {
    throw new ApiError(err.statusCode || 500, err.message);
  }
});

export const listMyScores = asyncHandler(async (req, res) => {
  const scoreList = await db
    .select()
    .from(scores)
    .where(eq(scores.userId, req.user.id))
    .orderBy(desc(scores.date))
    .limit(5);

  res.json({ success: true, scores: scoreList });
});

export const updateScore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  if (!validateScore(value)) {
    throw new ApiError(400, "Score must be an integer between 1 and 45");
  }

  const [score] = await db
    .select({ id: scores.id })
    .from(scores)
    .where(and(eq(scores.id, id), eq(scores.userId, req.user.id)))
    .limit(1);

  if (!score) {
    throw new ApiError(404, "Score not found");
  }

  const [updated] = await db.update(scores).set({ value, updatedAt: new Date() }).where(eq(scores.id, id)).returning();

  res.json({ success: true, score: updated });
});

export const deleteScore = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [score] = await db
    .select({ id: scores.id })
    .from(scores)
    .where(and(eq(scores.id, id), eq(scores.userId, req.user.id)))
    .limit(1);

  if (!score) {
    throw new ApiError(404, "Score not found");
  }

  await db.delete(scores).where(eq(scores.id, id));

  res.json({ success: true, message: "Score deleted" });
});
