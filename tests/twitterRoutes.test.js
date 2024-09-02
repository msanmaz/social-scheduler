import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../src/index.js';
import prisma from '../src/db/prisma.js';
import * as twitterAuthService from '../src/services/twitterAuthService.js';

describe('Twitter Routes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.twitterAuth.deleteMany();
    const password = await bcrypt.hash('hashpassword1', 10);
    const user = await prisma.user.create({
      data: {
        username: 'testuser1',
        email: 'test@example.com',
        password,
      },
    });
    userId = user.id;
    authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    // Mock twitterAuthService methods
    twitterAuthService.getTwitterAuthUrl = jest.fn();
    twitterAuthService.handleTwitterCallback = jest.fn();
    twitterAuthService.sendTweet = jest.fn();
    twitterAuthService.verifyTwitterCredentials = jest.fn();
  });

  afterEach(() => {
    // Clear all mocks
    jest.restoreAllMocks();
  });

  describe('GET /api/twitter/auth', () => {
    it('should initiate Twitter authentication', async () => {
      twitterAuthService.getTwitterAuthUrl.mockResolvedValue('https://twitter.com/oauth/authorize?oauth_token=mock_token');

      const res = await request(app)
        .get('/api/twitter/auth')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('authUrl');
      expect(res.body.authUrl).toContain('https://twitter.com/oauth/authorize');
      expect(twitterAuthService.getTwitterAuthUrl).toHaveBeenCalled();
    });
  });

  describe('GET /api/twitter/callback', () => {
    it('should handle Twitter callback successfully', async () => {
      twitterAuthService.handleTwitterCallback.mockResolvedValue({
        accessToken: 'mock_access_token',
        accessTokenSecret: 'mock_access_token_secret',
        screenName: 'testuser'
      });

      const res = await request(app)
        .get('/api/twitter/callback?oauth_token=mock_token&oauth_verifier=mock_verifier')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Twitter authentication successful');
      expect(res.body).toHaveProperty('screenName', 'testuser');
    });
  });

  describe('POST /api/twitter/tweet', () => {
    it('should send a tweet successfully', async () => {
      twitterAuthService.sendTweet.mockResolvedValue({ id: 'mock_tweet_id', text: 'Test tweet' });

      const res = await request(app)
        .post('/api/twitter/tweet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Test tweet' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Tweet sent successfully');
      expect(res.body).toHaveProperty('tweet');
      expect(res.body.tweet).toHaveProperty('id', 'mock_tweet_id');
    });
  });

  describe('GET /api/twitter/profile', () => {
    it('should fetch Twitter user profile successfully', async () => {
      twitterAuthService.verifyTwitterCredentials.mockResolvedValue({
        id: 'mock_twitter_id',
        screen_name: 'testuser',
        name: 'Test User'
      });

      const res = await request(app)
        .get('/api/twitter/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 'mock_twitter_id');
      expect(res.body).toHaveProperty('screen_name', 'testuser');
    });
  });
});