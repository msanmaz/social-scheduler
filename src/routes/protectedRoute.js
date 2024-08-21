import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
  // The user information is available in req.user
  res.json({ message: 'Protected route accessed', user: req.user });
});

export default router;
