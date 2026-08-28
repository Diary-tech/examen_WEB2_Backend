import { pool } from '../config/database';
import { User, UserWithoutPassword } from '../model/user';

const mapUser = (row: any): User => ({
  id: row.id,
  email: row.email,
  password: row.password,
  name: row.name,
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at,
});

const mapUserWithoutPassword = (row: any): UserWithoutPassword => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  isActive: row.is_active,
  createdAt: row.created_at,
});

export const findByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows.length ? mapUser(result.rows[0]) : null;
};

export const findById = async (id: number): Promise<UserWithoutPassword | null> => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows.length ? mapUserWithoutPassword(result.rows[0]) : null;
};

export const findAllStudents = async (): Promise<UserWithoutPassword[]> => {
  const result = await pool.query("SELECT * FROM users WHERE role = 'student' ");
  return result.rows.map(mapUserWithoutPassword);
};

export const createUser = async (data: {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'student';
}): Promise<UserWithoutPassword> => {
  const result = await pool.query(
    'INSERT INTO users (email, password, name, role, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *',
    [data.email, data.password, data.name, data.role]
  );
  return mapUserWithoutPassword(result.rows[0]);
};

export const updateUser = async (id: number,
  data: {
    email?: string;
    name?: string;
  }
): Promise<UserWithoutPassword | null> => {
  const result = await pool.query(`UPDATE users SET email = COALESCE($2, email),
      name = COALESCE($3, name) WHERE id = $1 AND role = 'student' RETURNING * `, [
    id,
    data.email ?? null,
    data.name ?? null]
  );
  return result.rows.length ? mapUserWithoutPassword(result.rows[0]) : null;
};

export const resetPasswordHash = async (id: number, password: string): Promise<User | null> => {
  const result = await pool.query(`UPDATE users SET password = $2 WHERE id = $1 AND role = 'student' RETURNING * `, [
    id,
    password]);
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