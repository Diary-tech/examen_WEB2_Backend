export type Role = 'admin' | 'student';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  password: string; 
}

export interface UpdateUserInput {
  email?: string;
  fullName?: string;
}