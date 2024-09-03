import express from 'express';
import { register, login, verifyJwtToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-token', verifyJwtToken);

export default router;
