import express from 'express';
import { body, query } from 'express-validator';
import {
  initiateTwitterAuth,
  handleTwitterCallback,
  sendTweet,
  getTwitterUserProfile,
} from '../controllers/twitterController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initiate Twitter authentication
router.get('/auth', authenticateToken, initiateTwitterAuth);

// Handle Twitter callback
router.get(
  '/callback',
  authenticateToken,
  [
    query('oauth_token').notEmpty().withMessage('OAuth token is required'),
    query('oauth_verifier').notEmpty().withMessage('OAuth verifier is required'),
  ],
  validateRequest,
  handleTwitterCallback,
);

// Send a tweet
router.post(
  '/tweet',
  authenticateToken,
  [
    body('content').notEmpty().withMessage('Tweet content is required')
      .isLength({ max: 280 })
      .withMessage('Tweet content must be 280 characters or less'),
  ],
  validateRequest,
  sendTweet,
);

// Get Twitter user profile
router.get('/profile', authenticateToken, getTwitterUserProfile);

export default router;
