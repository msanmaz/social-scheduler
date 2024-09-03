// src/index.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import twitterRoutes from './routes/twitterRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import logger from './utils/logger.js';
import redisClient, { cacheMiddleware } from './config/redis.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(apiLimiter);
app.use(cors({
  origin: 'http://localhost:3001', // your Next.js app's address
  credentials: true,
}));

// Redis test route
app.get('/redis-test', async (req, res) => {
  if (!redisClient) {
    return res.status(500).json({ message: 'Redis client is not initialized' });
  }
  try {
    await redisClient.set('test_key', 'Hello from Redis!');
    const value = await redisClient.get('test_key');
    res.json({ message: value });
  } catch (error) {
    logger.error('Redis test failed:', error);
    res.status(500).json({ message: 'Redis test failed', error: error.message });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Social Media Scheduler API' });
});

// Use auth routes
app.use('/auth', authRoutes);

// Use post routes (protected and cached)
app.use('/api/posts', authenticateToken, cacheMiddleware, postRoutes);

// Use Twitter routes
app.use('/api/twitter', twitterRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV === 'test') {
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}

export default app;
