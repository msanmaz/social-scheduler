// src/routes/postRoutes.js
import express from 'express';
import { body, param } from 'express-validator';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  getPostAnalytics,
} from '../controllers/postController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Create a new scheduled post
router.post(
  '/posts',
  [
    body('content').notEmpty().withMessage('Content is required'),
    body('platform').isIn(['twitter', 'instagram']).withMessage('Invalid platform'),
    body('scheduleTime').isISO8601().toDate().withMessage('Invalid schedule time'),
  ],
  validateRequest,
  createPost,
);

// Get all scheduled posts for the authenticated user
router.get('/posts', getPosts);

// Get a specific scheduled post
router.get('/posts/:id', param('id').isUUID(), validateRequest, getPost);

// Update a scheduled post
router.put(
  '/posts/:id',
  [
    param('id').isUUID(),
    body('content').optional().notEmpty(),
    body('platform').optional().isIn(['twitter', 'instagram']),
    body('scheduleTime').optional().isISO8601().toDate(),
  ],
  validateRequest,
  updatePost,
);

// Delete a scheduled post
router.delete('/posts/:id', param('id').isUUID(), validateRequest, deletePost);

// Get analytics for a specific post
router.get('/posts/:id/analytics', param('id').isUUID(), validateRequest, getPostAnalytics);

export default router;
