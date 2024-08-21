import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createUser, getUserByEmail } from '../models/userModel.js';

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
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
