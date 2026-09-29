import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_gym_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as any;

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
