import { pool } from '../config/Database';
import { User } from '../model/User';

const mapUser = (row: any): User => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  fullName: row.full_name,
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at,
});

export const findByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows.length ? mapUser(result.rows[0]) : null;
};

export const findById = async (id: number): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows.length ? mapUser(result.rows[0]) : null;
};

export const findAllStudents = async (): Promise<User[]> => {
  const result = await pool.query("SELECT * FROM users WHERE role = 'student' ");
  return result.rows.map(mapUser);
};