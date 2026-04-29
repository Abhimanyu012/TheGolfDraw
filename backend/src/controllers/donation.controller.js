import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { charities, donations } from "../db/schema.js";
import { ApiError, asyncHandler } from "../utils/http.js";

export const createDonation = asyncHandler(async (req, res) => {
  const { charityId, amountCents, source = "INDEPENDENT" } = req.body;

  if (!charityId || !Number.isInteger(amountCents) || amountCents <= 0) {
    throw new ApiError(400, "charityId and positive integer amountCents are required");
  }

  const [charity] = await db
    .select({ id: charities.id })
    .from(charities)
    .where(and(eq(charities.id, charityId), eq(charities.isActive, true)))
    .limit(1);

  if (!charity) {
    throw new ApiError(404, "Charity not found");
  }

  const [donation] = await db
    .insert(donations)
    .values({
      id: randomUUID(),
      userId: req.user?.id || null,
      charityId,
      amountCents,
      source,
    })
    .returning();

  res.status(201).json({ success: true, donation });
});

export const listMyDonations = asyncHandler(async (req, res) => {
  const donationList = await db
    .select({
      id: donations.id,
      charityId: donations.charityId,
      amountCents: donations.amountCents,
      source: donations.source,
      createdAt: donations.createdAt,
      charity: {
        id: charities.id,
        name: charities.name,
        slug: charities.slug,
      },
    })
    .from(donations)
    .leftJoin(charities, eq(donations.charityId, charities.id))
    .where(eq(donations.userId, req.user.id))
    .orderBy(desc(donations.createdAt));

  res.json({ success: true, donations: donationList });
});
