// src/config/redis.js
import Redis from 'ioredis';
import { promisify } from 'util';
import logger from '../utils/logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient;

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  redisClient.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });

  redisClient.on('connect', () => {
    logger.info(`Successfully connected to Redis at ${redisUrl}`);
  });
} catch (error) {
  logger.error('Failed to create Redis client:', error);
  redisClient = null;
}

export const getAsync = redisClient ? promisify(redisClient.get).bind(redisClient)
  : async () => null;
export const setAsync = redisClient ? promisify(redisClient.set).bind(redisClient)
  : async () => null;
export const delAsync = redisClient ? promisify(redisClient.del).bind(redisClient)
  : async () => null;

export const cacheMiddleware = async (req, res, next) => {
  if (!redisClient) {
    return next();
  }

  const key = `cache:${req.originalUrl}`;
  const cachedResponse = await getAsync(key);

  if (cachedResponse) {
    return res.json(JSON.parse(cachedResponse));
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    setAsync(key, JSON.stringify(body), 'EX', 3600); // Cache for 1 hour
    res.sendResponse(body);
  };

  next();
};

export default redisClient;
