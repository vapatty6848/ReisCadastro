import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, BaseError } from '../errors/app.errors';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError('Token não fornecido');
  }

  const [, token] = authHeader.split(' ');

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new BaseError('Configuração do servidor ausente (JWT_SECRET)', 500);
    }
    const decoded = jwt.verify(token, secret) as { userId: string };
    (req as any).userId = decoded.userId;
    return next();
  } catch (err) {
    if (err instanceof BaseError) throw err;
    throw new UnauthorizedError('Token inválido ou expirado');
  }
};
