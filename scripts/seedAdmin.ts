import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../src/config/database';

const seedAdmin = async () => {
  const email = process.env.ADMIN_INITIAL_EMAIL || 'admin@examhub.local';
  const password = process.env.ADMIN_INITIAL_PASSWORD || 'changeme';

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log('Admin already exists, skipping creation.');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

  await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role, is_active)
     VALUES ($1, $2, $3, 'admin', true)`,
    [email, passwordHash, 'Administrator']
  );

  console.log(`Admin created successfully : ${email}`);
  process.exit(0);
};

seedAdmin().catch(err => {
  console.error('Error while seeding admin :', err);
  process.exit(1);
});