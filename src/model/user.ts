export type Role = 'admin' | 'student';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
}