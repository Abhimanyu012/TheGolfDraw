import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { draws, users, winners } from "../db/schema.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { sendEmail } from "../utils/email.js";

export const listMyWinnings = asyncHandler(async (req, res) => {
  const winningsList = await db
    .select()
    .from(winners)
    .leftJoin(draws, eq(winners.drawId, draws.id))
    .where(eq(winners.userId, req.user.id))
    .orderBy(desc(winners.createdAt));

  const result = winningsList.map((w) => ({
    ...w.winners,
    draw: {
      month: w.draws?.month,
      year: w.draws?.year,
      numbers: w.draws?.numbers,
    },
  }));

  res.json({ success: true, winnings: result });
});

export const uploadWinnerProof = asyncHandler(async (req, res) => {
  const { winnerId } = req.params;
  const { proofUrl } = req.body;

  const uploadedProofUrl = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/proofs/${req.file.filename}`
    : null;

  const finalProofUrl = uploadedProofUrl || proofUrl;

  if (!finalProofUrl) {
    throw new ApiError(400, "Upload a file or provide proofUrl");
  }

  const [winner] = await db
    .select()
    .from(winners)
    .where(and(eq(winners.id, winnerId), eq(winners.userId, req.user.id)))
    .limit(1);

  if (!winner) {
    throw new ApiError(404, "Winner record not found");
  }

  const [updated] = await db
    .update(winners)
    .set({
      proofUrl: finalProofUrl,
      verificationStatus: "PENDING",
      updatedAt: new Date(),
    })
    .where(eq(winners.id, winnerId))
    .returning();

  res.json({ success: true, winner: updated });
});

export const listAllWinners = asyncHandler(async (req, res) => {
  const winnersList = await db
    .select()
    .from(winners)
    .leftJoin(draws, eq(winners.drawId, draws.id))
    .leftJoin(users, eq(winners.userId, users.id))
    .orderBy(desc(winners.createdAt));

  const result = winnersList.map((w) => ({
    ...w.winners,
    draw: { month: w.draws?.month, year: w.draws?.year },
    user: { id: w.users?.id, fullName: w.users?.fullName, email: w.users?.email },
  }));

  res.json({ success: true, winners: result });
});

export const reviewWinner = asyncHandler(async (req, res) => {
  const { winnerId } = req.params;
  const { verificationStatus, payoutStatus } = req.body;

  if (!["APPROVED", "REJECTED"].includes(verificationStatus)) {
    throw new ApiError(400, "verificationStatus must be APPROVED or REJECTED");
  }

  if (payoutStatus && !["PENDING", "PAID"].includes(payoutStatus)) {
    throw new ApiError(400, "Invalid payoutStatus");
  }

  const [winner] = await db
    .select()
    .from(winners)
    .where(eq(winners.id, winnerId))
    .limit(1);

  if (!winner) {
    throw new ApiError(404, "Winner not found");
  }

  const [updated] = await db
    .update(winners)
    .set({
      verificationStatus,
      payoutStatus: payoutStatus || winner.payoutStatus,
      reviewedById: req.user.id,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(winners.id, winnerId))
    .returning();

  const [userData] = await db
    .select({
      email: users.email,
      fullName: users.fullName,
    })
    .from(users)
    .where(eq(users.id, updated.userId))
    .limit(1);

  const [drawData] = await db
    .select({
      month: draws.month,
      year: draws.year,
    })
    .from(draws)
    .where(eq(draws.id, updated.drawId))
    .limit(1);

  await sendEmail({
    to: userData.email,
    subject: "Winner verification update",
    html: `<p>Hello ${userData.fullName},</p><p>Your winner record for draw ${drawData.month}/${drawData.year} was marked as ${updated.verificationStatus}. Payout status: ${updated.payoutStatus}.</p>`,
  });

  res.json({ success: true, winner: updated });
});
