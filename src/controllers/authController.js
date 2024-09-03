import bcrypt from 'bcrypt';
import { serialize } from 'cookie';
import { createUser, getUserByEmail } from '../models/userModel.js';
import { createJWT, verifyToken } from '../utils/auth.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await createUser(username, email, password);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    const user = await getUserByEmail(email);
    console.log('User found:', user);
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = createJWT(user);
    user.token = token;
    const serializedCookie = serialize('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/', // Make cookie available for all routes
      domain: 'localhost',
    });
    res.setHeader('Set-Cookie', serializedCookie);
    return res.json({ success: true, user });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const verifyJwtToken = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token is missing from the authorization header',
    });
  }

  try {
    const user = verifyToken(token);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
