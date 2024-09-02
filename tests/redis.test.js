// tests/redis.test.js
import request from 'supertest';
import app from '../src/index.js';

describe('Redis', () => {
  it('should connect to Redis and perform a test operation', async () => {
    const res = await request(app).get('/redis-test');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Hello from Redis!');
  });
});