import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("CRITICAL: DATABASE_URL is not set. Database features will fail.");
}

const client = connectionString ? postgres(connectionString, {
  prepare: false, // needed for Supabase pooler
}) : null;

export const db = client ? drizzle(client, { schema }) : null;

export async function checkDB() {
  if (!client) return;
  await client`select 1`;
  console.log("DB connected");
}

export async function closeDB() {
  if (client) await client.end();
}