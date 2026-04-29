import { randomUUID } from "crypto";
import { ApiError, asyncHandler } from "../utils/http.js";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../db/db.js";
import { charities } from "../db/schema.js";

const toSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export const listCharities = asyncHandler(async (req, res) => {
  const q = req.query.q?.toString().trim();

  const filters = [eq(charities.isActive, true)];

  if (q) {
    filters.push(or(ilike(charities.name, `%${q}%`), ilike(charities.description, `%${q}%`)));
  }

  const charitiesList = await db
    .select()
    .from(charities)
    .where(and(...filters))
    .orderBy(desc(charities.isFeatured), desc(charities.createdAt));

  res.json({ success: true, charities: charitiesList });
});

export const getCharityBySlug = asyncHandler(async (req, res) => {
  const [charity] = await db.select().from(charities).where(eq(charities.slug, req.params.slug)).limit(1);

  if (!charity || !charity.isActive) {
    throw new ApiError(404, "Charity not found");
  }

  res.json({ success: true, charity });
});

export const createCharity = asyncHandler(async (req, res) => {
  const { name, description, imageUrl, isFeatured = false, events = null } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "name and description are required");
  }

  const [charity] = await db
    .insert(charities)
    .values({
      id: randomUUID(),
      name,
      slug: toSlug(name),
      description,
      imageUrl,
      isFeatured,
      events,
    })
    .returning();

  res.status(201).json({ success: true, charity });
});

export const updateCharity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, imageUrl, isFeatured, isActive, events } = req.body;

  const existing = await db.query.charities.findFirst({ where: eq(charities.id, id) });

  if (!existing) {
    throw new ApiError(404, "Charity not found");
  }

  const [charity] = await db
    .update(charities)
    .set({
      name: name ?? existing.name,
      slug: name ? toSlug(name) : existing.slug,
      description: description ?? existing.description,
      imageUrl: imageUrl ?? existing.imageUrl,
      isFeatured: isFeatured ?? existing.isFeatured,
      isActive: isActive ?? existing.isActive,
      events: events ?? existing.events,
      updatedAt: new Date(),
    })
    .where(eq(charities.id, id))
    .returning();

  res.json({ success: true, charity });
});

export const deleteCharity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await db.query.charities.findFirst({ where: eq(charities.id, id) });

  if (!existing) {
    throw new ApiError(404, "Charity not found");
  }

  await db.update(charities).set({ isActive: false, updatedAt: new Date() }).where(eq(charities.id, id));

  res.json({ success: true, message: "Charity archived" });
});
