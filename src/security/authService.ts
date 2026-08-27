import * as userRepository from '../Repositorie/userRepository';
import { comparePassword } from '../security/hash';
import { signToken } from '../security/jwt';
import { UnauthorizedError, ForbiddenError } from './errors';

export const login = async (email: string, password: string) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Email or password incorrect');
  }

  if (!user.isActive) {
    throw new ForbiddenError('This account has been deactivated'); 
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Email or password incorrect');
  }

  const token = signToken({ id: user.id, role: user.role });

  const { passwordHash, ...publicUser } = user;
  return { token, user: publicUser };
};