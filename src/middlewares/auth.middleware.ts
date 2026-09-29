import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { sendError } from '../utils/response.util';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Autentikasi gagal. Token Bearer diperlukan.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return sendError(res, 401, 'Token tidak valid atau sudah kadaluarsa.');
  }
}
