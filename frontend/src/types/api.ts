export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  events?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface Score {
  id: string;
  userId: string;
  value: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELED' | 'LAPSED';
  amountCents: number;
  startsAt: string;
  renewsAt: string;
  endsAt?: string | null;
}

export interface Winner {
  id: string;
  drawId: string;
  userId: string;
  matchCount: number;
  tier: 'FIVE' | 'FOUR' | 'THREE';
  amountCents: number;
  proofUrl?: string | null;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  payoutStatus: 'PENDING' | 'PAID';
  createdAt: string;
  updatedAt: string;
  draw?: { month: number; year: number; numbers: number[] };
  user?: { fullName: string };
}

export interface Draw {
  id: string;
  month: number;
  year: number;
  logic: 'RANDOM' | 'MOST_FREQUENT' | 'LEAST_FREQUENT';
  numbers: number[];
  status: 'DRAFT' | 'PUBLISHED';
  totalPoolCents: number;
  pool5Cents: number;
  pool4Cents: number;
  pool3Cents: number;
  jackpotCarryInCents: number;
  jackpotCarryOutCents: number;
  publishedAt?: string | null;
  winners?: Winner[];
}

export interface DashboardData {
  subscription: Subscription | null;
  scores: Score[];
  charity: Charity | null;
  charityContributionPercent: number;
  participation: {
    drawsEntered: number;
    upcomingDraw: { month: number; year: number };
  };
  winnings: {
    totalWonCents: number;
    entries: Winner[];
  };
  donations: {
    totalDonatedCents: number;
    entries: Array<{ amountCents: number; source: string }>;
  };
}

export interface AdminDashboardData {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePoolCents: number;
  totalPaidOutCents: number;
  charityContributionTotals: Array<{ charityId: string; _sum: { amountCents: number } }>;
  drawStats: Array<{
    id: string;
    month: number;
    year: number;
    totalPoolCents: number;
    winners: Array<{ id: string; tier: 'FIVE' | 'FOUR' | 'THREE' }>;
  }>;
}