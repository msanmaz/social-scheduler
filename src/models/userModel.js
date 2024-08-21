import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const createUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });
};

export const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      twitterAuth: true,
      instagramAuth: true,
    },
  });
};

export const addTwitterAuth = async (userId, accessToken, refreshToken, tokenExpiry, screenName) => {
  return prisma.twitterAuth.upsert({
    where: { userId },
    update: { accessToken, refreshToken, tokenExpiry, screenName },
    create: { userId, accessToken, refreshToken, tokenExpiry, screenName },
  });
};

export const addInstagramAuth = async (userId, accessToken, tokenExpiry, username) => {
  return prisma.instagramAuth.upsert({
    where: { userId },
    update: { accessToken, tokenExpiry, username },
    create: { userId, accessToken, tokenExpiry, username },
  });
};

export const getUserWithSocialConnections = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      twitterAuth: true,
      instagramAuth: true,
    },
  });
};