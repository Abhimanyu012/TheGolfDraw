import { count, desc, eq, sum } from "drizzle-orm";
import { db } from "../db/db.js";
import { charities, donations, draws, scores, subscriptions, users, winners } from "../db/schema.js";
import { asyncHandler } from "../utils/http.js";

export const getUserDashboard = asyncHandler(async (req, res) => {
  const [subscriptionData] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, req.user.id))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  const scoreList = await db
    .select()
    .from(scores)
    .where(eq(scores.userId, req.user.id))
    .orderBy(desc(scores.date))
    .limit(5);

  const [userData] = await db
    .select()
    .from(users)
    .where(eq(users.id, req.user.id))
    .limit(1);

  const winningsList = await db
    .select({ amountCents: winners.amountCents, payoutStatus: winners.payoutStatus, verificationStatus: winners.verificationStatus })
    .from(winners)
    .where(eq(winners.userId, req.user.id));

  const [drawCountResult] = await db
    .select({ count: count() })
    .from(draws)
    .where(eq(draws.status, "PUBLISHED"));

  const donationList = await db
    .select({ amountCents: donations.amountCents, source: donations.source })
    .from(donations)
    .where(eq(donations.userId, req.user.id));

  const [charityData] = userData?.selectedCharityId
    ? await db
        .select({ id: charities.id, name: charities.name, slug: charities.slug })
        .from(charities)
        .where(eq(charities.id, userData.selectedCharityId))
        .limit(1)
    : [null];

  const totalWonCents = winningsList.reduce((acc, row) => acc + row.amountCents, 0);
  const totalDonatedCents = donationList.reduce((acc, row) => acc + row.amountCents, 0);
  const now = new Date();
  const nextMonthDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  res.json({
    success: true,
    dashboard: {
      subscription: subscriptionData,
      scores: scoreList,
      charity: charityData || null,
      charityContributionPercent: userData?.charityContributionPercentage ?? 10,
      participation: {
        drawsEntered: Number(drawCountResult?.count || 0),
        upcomingDraw: {
          month: nextMonthDate.getUTCMonth() + 1,
          year: nextMonthDate.getUTCFullYear(),
        },
      },
      winnings: {
        totalWonCents,
        entries: winningsList,
      },
      donations: {
        totalDonatedCents,
        entries: donationList,
      },
    },
  });
});

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalUsersResult] = await db.select({ count: count() }).from(users);
  const [activeSubsResult] = await db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, "ACTIVE"));
  const [poolResult] = await db.select({ total: sum(draws.totalPoolCents) }).from(draws);
  const [paidResult] = await db.select({ total: sum(winners.amountCents) }).from(winners).where(eq(winners.payoutStatus, "PAID"));

  const drawStatsList = await db
    .select()
    .from(draws)
    .leftJoin(winners, eq(draws.id, winners.drawId))
    .where(eq(draws.status, "PUBLISHED"))
    .orderBy(desc(draws.year), desc(draws.month))
    .limit(12);

  const drawStats = drawStatsList.reduce((acc, item) => {
    const drawId = item.draws?.id;
    const existing = acc.find((d) => d.id === drawId);
    if (existing) {
      existing.winners.push({ id: item.winners?.id, tier: item.winners?.tier });
    } else {
      acc.push({
        id: drawId,
        month: item.draws?.month,
        year: item.draws?.year,
        totalPoolCents: item.draws?.totalPoolCents,
        winners: item.winners ? [{ id: item.winners.id, tier: item.winners.tier }] : [],
      });
    }
    return acc;
  }, []);

  res.json({
    success: true,
    dashboard: {
      totalUsers: Number(totalUsersResult?.count || 0),
      activeSubscribers: Number(activeSubsResult?.count || 0),
      totalPrizePoolCents: Number(poolResult?.total || 0),
      totalPaidOutCents: Number(paidResult?.total || 0),
      charityContributionTotals: [],
      drawStats,
    },
  });
});
