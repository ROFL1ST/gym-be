import { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  statusCode = 200,
  message = 'Success',
  data?: T,
  meta?: Record<string, any>
) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  });
}

export function sendError(
  res: Response,
  statusCode = 400,
  message = 'Error',
  errors?: any
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors !== undefined && { errors }),
  });
}
