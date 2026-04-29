#!/usr/bin/env node
import 'dotenv/config';
import { randomUUID } from 'crypto';
import { db } from '../src/db/db.js';
import { charities } from '../src/db/schema.js';

async function run() {
  try {
    const id = randomUUID();
    const slug = `seed-charity-${Date.now()}`;
    const now = new Date();
    const [created] = await db.insert(charities).values({
      id,
      name: 'Seed Charity',
      slug,
      description: 'Automatically seeded charity for testing',
      imageUrl: null,
      isFeatured: false,
      isActive: true,
      events: [],
      createdAt: now,
      updatedAt: now,
    }).returning();

    console.log(JSON.stringify({ id: created.id, slug: created.slug }));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
