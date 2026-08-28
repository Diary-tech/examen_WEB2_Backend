import bcrypt from 'bcrypt';
import * as userRepository from '../Repositorie/userRepository';
import { CreateUserInput, UpdateUserInput } from '../model/user';
import { BadRequestError, ConflictError, NotFoundError } from '../security/errors';

export const listStudents = async () => {
  return userRepository.findAllStudents(); 
};

export const createStudent = async (input: CreateUserInput) => {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

  return userRepository.createUser({
    email: input.email,
    name: input.name,
    password: passwordHash,
    role: 'student',
  });
}

export const updateStudent = async (id: number, input: UpdateUserInput) => {
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

export const resetPassword = async (id: number, newPassword: string) => {
  const student = await userRepository.findById(id);
  if (!student) throw new NotFoundError('Student not found');
  if (!newPassword || newPassword.length < 6) {
    throw new BadRequestError('The password must contain at least 6 characters');
  }
  const passwordHash = await bcrypt.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
  return userRepository.resetPasswordHash(id, passwordHash);
}

export const desactivateStudent = async (id: number) => {
  const student = await userRepository.findById(id);
  if (!student) throw new NotFoundError('Student not found');
  return userRepository.desactivateStudent(id);
}

export const activateStudent = async (id: number) => {
  const student = await userRepository.findById(id);
  if (!student) throw new NotFoundError('Student not found');
  return userRepository.activateStudent(id);
}