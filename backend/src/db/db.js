import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString, {
  prepare: false, // needed for Supabase pooler
});

export const db = drizzle(client, { schema });

export async function checkDB() {
  await client`select 1`;
  console.log("DB connected");
}

export async function closeDB() {
  await client.end();
}