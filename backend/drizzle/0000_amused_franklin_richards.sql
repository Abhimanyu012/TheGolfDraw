CREATE TYPE "public"."donation_source" AS ENUM('SUBSCRIPTION', 'INDEPENDENT');--> statement-breakpoint
CREATE TYPE "public"."draw_logic" AS ENUM('RANDOM', 'MOST_FREQUENT', 'LEAST_FREQUENT');--> statement-breakpoint
CREATE TYPE "public"."draw_status" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('PENDING', 'PAID');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'CANCELED', 'LAPSED', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."winner_tier" AS ENUM('FIVE', 'FOUR', 'THREE');--> statement-breakpoint
CREATE TABLE "charities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"events" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"charity_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"source" "donation_source" DEFAULT 'INDEPENDENT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "draws" (
	"id" text PRIMARY KEY NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"logic" "draw_logic" DEFAULT 'RANDOM' NOT NULL,
	"numbers" integer[] NOT NULL,
	"status" "draw_status" DEFAULT 'DRAFT' NOT NULL,
	"total_pool_cents" integer DEFAULT 0 NOT NULL,
	"pool5_cents" integer DEFAULT 0 NOT NULL,
	"pool4_cents" integer DEFAULT 0 NOT NULL,
	"pool3_cents" integer DEFAULT 0 NOT NULL,
	"jackpot_carry_in_cents" integer DEFAULT 0 NOT NULL,
	"jackpot_carry_out_cents" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"value" integer NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan" "subscription_plan" NOT NULL,
	"status" "subscription_status" DEFAULT 'ACTIVE' NOT NULL,
	"amount_cents" integer NOT NULL,
	"starts_at" timestamp NOT NULL,
	"renews_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"selected_charity_id" text,
	"charity_contribution_percent" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "winners" (
	"id" text PRIMARY KEY NOT NULL,
	"draw_id" text NOT NULL,
	"user_id" text NOT NULL,
	"match_count" integer NOT NULL,
	"tier" "winner_tier" NOT NULL,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"proof_url" text,
	"verification_status" "verification_status" DEFAULT 'PENDING' NOT NULL,
	"payout_status" "payout_status" DEFAULT 'PENDING' NOT NULL,
	"reviewed_by_id" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_charity_id_charities_id_fk" FOREIGN KEY ("charity_id") REFERENCES "public"."charities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_selected_charity_id_charities_id_fk" FOREIGN KEY ("selected_charity_id") REFERENCES "public"."charities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winners" ADD CONSTRAINT "winners_draw_id_draws_id_fk" FOREIGN KEY ("draw_id") REFERENCES "public"."draws"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winners" ADD CONSTRAINT "winners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "winners" ADD CONSTRAINT "winners_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "charities_slug_unique" ON "charities" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "draws_month_year_unique" ON "draws" USING btree ("month","year");--> statement-breakpoint
CREATE UNIQUE INDEX "scores_user_id_date_unique" ON "scores" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "winners_draw_id_user_id_unique" ON "winners" USING btree ("draw_id","user_id");