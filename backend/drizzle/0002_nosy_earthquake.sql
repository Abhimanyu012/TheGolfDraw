CREATE INDEX "donations_user_id_idx" ON "donations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "donations_charity_id_idx" ON "donations" USING btree ("charity_id");--> statement-breakpoint
CREATE INDEX "scores_user_id_idx" ON "scores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "winners_draw_id_idx" ON "winners" USING btree ("draw_id");--> statement-breakpoint
CREATE INDEX "winners_user_id_idx" ON "winners" USING btree ("user_id");