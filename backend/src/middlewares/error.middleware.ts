import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/app.errors';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError || err instanceof BaseError) {
    const statusCode = (err as any).statusCode || 400;
    return res.status(statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error(' [Internal Error] ', err);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
};
