import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { hashPassword, isValidEmail, isValidPassword } from './password';

export type AuthUser = {
  id: string;
  email: string;
};

export class RegisterError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'RegisterError';
  }
}

export async function registerUser(
  email: string,
  password: string,
): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    throw new RegisterError('Invalid email', 400);
  }

  if (!isValidPassword(password)) {
    throw new RegisterError('Password must be at least 8 characters', 400);
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
      },
      select: { id: true, email: true },
    });

    return user;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new RegisterError('Email already registered', 409);
    }
    throw error;
  }
}
