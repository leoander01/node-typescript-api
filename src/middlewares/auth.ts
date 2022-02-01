import AuthService from '@src/services/auth';
import { NextFunction, Request, Response } from 'express';

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  const token = req.headers?.['x-access-token'];
  try {
    const decode = AuthService.decodeToken(token as string);
    req.decode = decode;
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status?.(401).send({ code: 401, error: err.message });
    } else {
      res.status?.(401).send({ code: 401, error: 'Unknown auth error' });
    }
  }
}
