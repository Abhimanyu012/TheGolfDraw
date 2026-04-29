import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL);

async function createAdmin() {
  const email = 'admin@thegolfdraw.com';
  const password = 'AdminPassword123!';
  const fullName = 'System Administrator';

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  
  if (existing.length > 0) {
    console.log('Admin already exists. Promoting...');
    await sql`UPDATE users SET role = 'admin' WHERE email = ${email}`;
    console.log('Promoted successfully.');
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`
      INSERT INTO users (id, full_name, email, password_hash, role)
      VALUES (${randomUUID()}, ${fullName}, ${email}, ${hashedPassword}, 'admin')
    `;
    console.log('Admin created successfully.');
    console.log('Email:', email);
    console.log('Password:', password);
  }
  
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
