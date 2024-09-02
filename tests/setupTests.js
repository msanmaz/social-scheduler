import prisma from '../src/db/prisma.js';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.scheduledPost.deleteMany();
  await prisma.user.deleteMany();
});