import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { draws, subscriptions, users, winners } from "../db/schema.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { sendBulkEmail } from "../utils/email.js";
import { getMonthYear, runDrawEngine } from "../services/draw.service.js";

export const simulateDraw = asyncHandler(async (req, res) => {
  const { logic = "RANDOM" } = req.body;

  if (!["RANDOM", "MOST_FREQUENT", "LEAST_FREQUENT"].includes(logic)) {
    throw new ApiError(400, "Invalid logic");
  }

  const [previous] = await db
    .select()
    .from(draws)
    .where(eq(draws.status, "PUBLISHED"))
    .orderBy(desc(draws.year), desc(draws.month))
    .limit(1);

  const result = await runDrawEngine({
    logic,
    carryInCents: previous?.jackpotCarryOutCents || 0,
  });

  res.json({ success: true, simulation: result });
});

export const publishDraw = asyncHandler(async (req, res) => {
  const { logic = "RANDOM", month, year } = req.body;
  const period = getMonthYear({ month, year });

  const [existing] = await db
    .select()
    .from(draws)
    .where(and(eq(draws.month, period.month), eq(draws.year, period.year)))
    .limit(1);

  if (existing) {
    throw new ApiError(409, "Draw for this month already exists");
  }

  const [previous] = await db
    .select()
    .from(draws)
    .where(eq(draws.status, "PUBLISHED"))
    .orderBy(desc(draws.year), desc(draws.month))
    .limit(1);

  const result = await runDrawEngine({
    logic,
    carryInCents: previous?.jackpotCarryOutCents || 0,
  });

  const [draw] = await db
    .insert(draws)
    .values({
      id: randomUUID(),
      month: period.month,
      year: period.year,
      logic,
      numbers: result.numbers,
      status: "PUBLISHED",
      totalPoolCents: result.totalPoolCents,
      pool5Cents: result.pool5Cents,
      pool4Cents: result.pool4Cents,
      pool3Cents: result.pool3Cents,
      jackpotCarryInCents: result.jackpotCarryInCents,
      jackpotCarryOutCents: result.jackpotCarryOutCents,
      publishedAt: new Date(),
    })
    .returning();

  for (const w of result.winners) {
    await db.insert(winners).values({
      id: randomUUID(),
      drawId: draw.id,
      userId: w.userId,
      matchCount: w.matchCount,
      tier: w.tier,
      amountCents: w.amountCents,
    });
  }

  const drawWinners = await db
    .select()
    .from(winners)
    .leftJoin(users, eq(winners.userId, users.id))
    .where(eq(winners.drawId, draw.id));

  const activeUserList = await db
    .selectDistinct({ userId: subscriptions.userId })
    .from(subscriptions)
    .leftJoin(users, eq(subscriptions.userId, users.id))
    .where(eq(subscriptions.status, "ACTIVE"));

  const activeUsers = await Promise.all(
    activeUserList.map(async (sub) => {
      const [user] = await db
        .select({ email: users.email, fullName: users.fullName })
        .from(users)
        .where(eq(users.id, sub.userId))
        .limit(1);
      return user;
    })
  );

  // Fire-and-forget email notifications to prevent blocking the HTTP response
  Promise.resolve().then(async () => {
    try {
      await sendBulkEmail({
        recipients: activeUsers.map((x) => x.user.email),
        subject: `Draw Results Published (${period.month}/${period.year})`,
        htmlBuilder: (to) => {
          const user = activeUsers.find((x) => x.user.email === to)?.user;
          return `<p>Hello ${user?.fullName || "Subscriber"},</p><p>The draw results for ${period.month}/${period.year} are now published. Winning numbers: ${result.numbers.join(", ")}.</p>`;
        },
      });

      const winnerRecipients = drawWinners
        .map((w) => w.users?.email)
        .filter(Boolean);
      await sendBulkEmail({
        recipients: winnerRecipients,
        subject: "You have a winner status in this month draw",
        htmlBuilder: (to) => {
          const winner = drawWinners.find((w) => w.users?.email === to);
          return `<p>Congratulations ${winner?.users?.fullName || "Winner"},</p><p>You matched ${winner?.winners?.matchCount} numbers and your provisional payout is ₹${((winner?.winners?.amountCents || 0) / 100).toFixed(2)}. Please upload proof from your dashboard.</p>`;
        },
      });
    } catch (emailErr) {
      console.error("Failed to send bulk emails:", emailErr);
    }
  });

  res.status(201).json({
    success: true,
    draw: { ...draw, winners: drawWinners.map((w) => ({ ...w.winners, user: w.users })) },
  });


});

export const listPublishedDraws = asyncHandler(async (req, res) => {
  const drawList = await db
    .select()
    .from(draws)
    .where(eq(draws.status, "PUBLISHED"))
    .orderBy(desc(draws.year), desc(draws.month));

  const result = await Promise.all(
    drawList.map(async (draw) => {
      const winnersList = await db
        .select({
          id: winners.id,
          tier: winners.tier,
          amountCents: winners.amountCents,
          payoutStatus: winners.payoutStatus,
          verificationStatus: winners.verificationStatus,
          userId: winners.userId,
        })
        .from(winners)
        .where(eq(winners.drawId, draw.id));
      return { ...draw, winners: winnersList };
    })
  );

  res.json({ success: true, draws: result });
});
