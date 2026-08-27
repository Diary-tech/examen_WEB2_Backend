import { pool } from '../config/database';
import { User } from '../model/user';

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

export const createUser = async (data: {
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'admin' | 'student';
}): Promise<User> => {
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *',
    [data.email, data.passwordHash, data.fullName, data.role]
  );
  return mapUser(result.rows[0]);
};

export const updateUser = async (id: number,
    data: {
      email?: string;
      fullName?: string;
    }
): Promise<User | null> => {
  const result = await pool.query(`UPDATE users SET email = COALESCE($2, email),
      full_name = COALESCE($3, full_name) WHERE id = $1 AND role = 'student' RETURNING * `, [
          id,
          data.email ?? null,
          data.fullName ?? null]
  );
  return result.rows.length ? mapUser(result.rows[0]) : null;
};

export const resetPasswordHash = async (id: number, passwordHash: string): Promise<User | null> => {
  const result = await pool.query(`UPDATE users SET password_hash = $2 WHERE id = $1 AND role = 'student' RETURNING * `, [
    id,
    passwordHash]);
  return result.rows.length ? mapUser(result.rows[0]) : null;
};

export const desactivateStudent = async (id: number): Promise<User | null> => {
  const result = await pool.query(
    "UPDATE users SET is_active = false WHERE id = $1 AND role = 'student' RETURNING *",
    [id]
  );
  return result.rows.length ? mapUser(result.rows[0]) : null;
};

export const activateStudent = async (id: number): Promise<User | null> => {
  const result = await pool.query(
    "UPDATE users SET is_active = true WHERE id = $1 AND role = 'student' RETURNING *",
    [id]
  );
  return result.rows.length ? mapUser(result.rows[0]) : null;
};