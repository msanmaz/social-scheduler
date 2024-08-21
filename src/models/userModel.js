import bcrypt from 'bcrypt';
import prisma from '../db/prisma.js';

export const createUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { username, email, password: hashedPassword },
    select: { id: true, username: true, email: true },
  });
};

export const getUserByEmail = async (email) => prisma.user.findUnique({
  where: { email },
  include: { twitterAuth: true, instagramAuth: true },
});

export const addTwitterAuth = async (
  userId,
  accessToken,
  refreshToken,
  tokenExpiry,
  screenName,
) => prisma.twitterAuth.upsert({
  where: { userId },
  update:
  {
    accessToken, refreshToken, tokenExpiry, screenName,
  },
  create: {
    userId, accessToken, refreshToken, tokenExpiry, screenName,
  },
});

export const addInstagramAuth = async (
  userId,
  accessToken,
  tokenExpiry,
  username,
) => prisma.twitterAuth.upsert({
  where: { userId },
  update: { accessToken, tokenExpiry, username },
  create: {
    userId, accessToken, tokenExpiry, username,
  },
});

export const getUserWithSocialConnections = async (userId) => prisma.user.findUnique({
  where: { id: userId },
  include: { twitterAuth: true, instagramAuth: true },
});
