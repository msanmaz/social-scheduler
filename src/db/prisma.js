import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => new PrismaClient();

const prisma = process.env.NODE_ENV === 'production'
  ? prismaClientSingleton()
  : global.prisma ?? (global.prisma = prismaClientSingleton());

export default prisma;
