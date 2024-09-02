// src/middleware/errorMiddleware.js
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};
