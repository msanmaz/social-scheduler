// tests/authRoutes.test.js
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/index.js';
import prisma from '../src/db/prisma.js';

describe('Auth Routes', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'test@gmail.com',
        password: 'test123',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.username).toBe('testuser');
  });

  it('should login a user', async () => {
    // Create a user first
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@gmail.com',
        password: hashedPassword,
      },
    });
    console.log('Created user:', createdUser);

    // Verify the user was created
    const userInDb = await prisma.user.findUnique({ where: { email: 'test@gmail.com' } });
    console.log('User in DB:', userInDb);

    // Attempt login
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@gmail.com',
        password,
      });
    console.log('Login response:', res.body);
    // Additional logging
    if (res.statusCode !== 200) {
      console.log('Login failed. Status code:', res.statusCode);
      console.log('Response body:', res.body);
    }

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with incorrect credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toBe(401);
  });
});
