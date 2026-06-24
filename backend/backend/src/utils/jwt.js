import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export const generateToken = (
  payload
) => {
  return jwt.sign(
    payload,
    env.JWT_SECRET,
    {
      expiresIn:
        env.JWT_EXPIRES_IN
    }
  );
};


// Varify Token
 
export const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
};