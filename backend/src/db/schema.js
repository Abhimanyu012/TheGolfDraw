import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["MONTHLY", "YEARLY"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["ACTIVE", "CANCELED", "LAPSED", "INACTIVE"]);
export const donationSourceEnum = pgEnum("donation_source", ["SUBSCRIPTION", "INDEPENDENT"]);
export const winnerTierEnum = pgEnum("winner_tier", ["FIVE", "FOUR", "THREE"]);
export const verificationStatusEnum = pgEnum("verification_status", ["PENDING", "APPROVED", "REJECTED"]);
export const payoutStatusEnum = pgEnum("payout_status", ["PENDING", "PAID"]);
export const drawStatusEnum = pgEnum("draw_status", ["DRAFT", "PUBLISHED"]);
export const drawLogicEnum = pgEnum("draw_logic", ["RANDOM", "MOST_FREQUENT", "LEAST_FREQUENT"]);

const id = () => text("id").primaryKey().notNull();

export const charities = pgTable(
  "charities",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    events: jsonb("events").default(null),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("charities_slug_unique").on(table.slug),
  ],
);

export const users = pgTable(
  "users",
  {
    id: id(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    password: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    selectedCharityId: text("selected_charity_id").references(() => charities.id, { onDelete: "set null" }),
    charityContributionPercentage: integer("charity_contribution_percent").notNull().default(10),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
  ],
);

export const scores = pgTable(
  "scores",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    value: integer("value").notNull(),
    date: date("date", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("scores_user_id_date_unique").on(table.userId, table.date),
    index("scores_user_id_idx").on(table.userId),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    plan: subscriptionPlanEnum("plan").notNull(),
    status: subscriptionStatusEnum("status").notNull().default("ACTIVE"),
    amountCents: integer("amount_cents").notNull(),
    startsAt: timestamp("starts_at", { mode: "date" }).notNull(),
    renewsAt: timestamp("renews_at", { mode: "date" }).notNull(),
    endsAt: timestamp("ends_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
  ],
);

export const donations = pgTable(
  "donations",
  {
    id: id(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    charityId: text("charity_id").notNull().references(() => charities.id, { onDelete: "restrict" }),
    amountCents: integer("amount_cents").notNull(),
    source: donationSourceEnum("source").notNull().default("INDEPENDENT"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("donations_user_id_idx").on(table.userId),
    index("donations_charity_id_idx").on(table.charityId),
  ],
);

export const draws = pgTable(
  "draws",
  {
    id: id(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    logic: drawLogicEnum("logic").notNull().default("RANDOM"),
    numbers: integer("numbers").array().notNull(),
    status: drawStatusEnum("status").notNull().default("DRAFT"),
    totalPoolCents: integer("total_pool_cents").notNull().default(0),
    pool5Cents: integer("pool5_cents").notNull().default(0),
    pool4Cents: integer("pool4_cents").notNull().default(0),
    pool3Cents: integer("pool3_cents").notNull().default(0),
    jackpotCarryInCents: integer("jackpot_carry_in_cents").notNull().default(0),
    jackpotCarryOutCents: integer("jackpot_carry_out_cents").notNull().default(0),
    publishedAt: timestamp("published_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("draws_month_year_unique").on(table.month, table.year),
  ],
);

export const winners = pgTable(
  "winners",
  {
    id: id(),
    drawId: text("draw_id").notNull().references(() => draws.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    matchCount: integer("match_count").notNull(),
    tier: winnerTierEnum("tier").notNull(),
    amountCents: integer("amount_cents").notNull().default(0),
    proofUrl: text("proof_url"),
    verificationStatus: verificationStatusEnum("verification_status").notNull().default("PENDING"),
    payoutStatus: payoutStatusEnum("payout_status").notNull().default("PENDING"),
    reviewedById: text("reviewed_by_id").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("winners_draw_id_user_id_unique").on(table.drawId, table.userId),
    index("winners_draw_id_idx").on(table.drawId),
    index("winners_user_id_idx").on(table.userId),
  ],
);

export const charityRelations = relations(charities, ({ many }) => ({
  users: many(users),
  donations: many(donations),
}));

export const userRelations = relations(users, ({ many }) => ({
  scores: many(scores),
  subscriptions: many(subscriptions),
  donations: many(donations),
  winnings: many(winners),
  reviewedWinners: many(winners, { relationName: "reviewedBy" }),
}));

export const scoreRelations = relations(scores, ({ one }) => ({
  user: one(users, {
    fields: [scores.userId],
    references: [users.id],
  }),
}));

export const subscriptionRelations = relations(subscriptions, ({ many, one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const donationRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.userId],
    references: [users.id],
  }),
  charity: one(charities, {
    fields: [donations.charityId],
    references: [charities.id],
  }),
}));

export const drawRelations = relations(draws, ({ many }) => ({
  winners: many(winners),
}));

export const winnerRelations = relations(winners, ({ one }) => ({
  draw: one(draws, {
    fields: [winners.drawId],
    references: [draws.id],
  }),
  user: one(users, {
    fields: [winners.userId],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [winners.reviewedById],
    references: [users.id],
    relationName: "reviewedBy",
  }),
}));

export const schema = {
  charities,
  users,
  scores,
  subscriptions,
  donations,
  draws,
  winners,
};