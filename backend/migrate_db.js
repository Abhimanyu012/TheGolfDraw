import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL);

async function runMigrations() {
  try {
    console.log('Renaming name to full_name...');
    await sql`ALTER TABLE users RENAME COLUMN name TO full_name;`;
  } catch (e) {
    console.log('name already renamed or does not exist:', e.message);
  }

  try {
    console.log('Renaming password to password_hash...');
    await sql`ALTER TABLE users RENAME COLUMN password TO password_hash;`;
  } catch (e) {
    console.log('password already renamed or does not exist:', e.message);
  }

  try {
    console.log('Adding selected_charity_id...');
    await sql`ALTER TABLE users ADD COLUMN selected_charity_id text;`;
  } catch (e) {
    console.log('selected_charity_id already exists:', e.message);
  }

  try {
    console.log('Adding charity_contribution_percent...');
    await sql`ALTER TABLE users ADD COLUMN charity_contribution_percent integer NOT NULL DEFAULT 10;`;
  } catch (e) {
    console.log('charity_contribution_percent already exists:', e.message);
  }

  console.log('Migration complete!');
  process.exit(0);
}

runMigrations();
