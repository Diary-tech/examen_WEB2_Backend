import bcrypt from 'bcrypt';
import * as userRepository from '../Repositorie/UserRepository';
import { CreateUserInput, UpdateUserInput } from '../model/User';
import { BadRequestError, ConflictError, NotFoundError } from '../Security/errors';

export async function listStudents() {
  return userRepository.findAllStudents(); 
}

export async function createStudent(input: CreateUserInput) {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

  return userRepository.createUser({
    email: input.email,
    fullName: input.fullName,
    passwordHash,
    role: 'student',
  });
}

export async function updateStudent(id: number, input: UpdateUserInput) {
  const student = await userRepository.findById(id);
  if (!student) throw new NotFoundError('Student not found');

  if (input.email) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing && existing.id !== id) {
      throw new ConflictError('This email is already in use');
    }
  }

  return userRepository.updateUser(id, input);
}

export async function resetPassword(id: number, newPassword: string) {
  const student = await userRepository.findById(id);
  if (!student) throw new NotFoundError('Student not found');
  if (!newPassword || newPassword.length < 6) {
    throw new BadRequestError('The password must contain at least 6 characters');
  }
  const passwordHash = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
  return userRepository.resetPasswordHash(id, passwordHash);
}

export async function desactivateStudent(id: number) {
  const student = await userRepository.findById(id);
  if (!student) throw new NotFoundError('Student not found');
  return userRepository.setActive(id, false);
}