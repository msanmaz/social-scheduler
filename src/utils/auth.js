import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const comparePasswords = (password, hash) => bcrypt.compare(password, hash);

export const hashPassword = (password) => bcrypt.hash(password, 5);

export const createJWT = (user) => {
  const secretBuffer = Buffer.from(process.env.JWT_SECRET, 'base64');

  const token = jwt.sign(
    { id: user.id },
    secretBuffer,
    {
      expiresIn: '1h',
      algorithm: 'HS256',
    },
  );
  return token;
};

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
