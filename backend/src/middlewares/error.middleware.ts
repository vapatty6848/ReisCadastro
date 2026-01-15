import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/app.errors';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.details && { details: err.details })
    });
  }

  // Erros do Multer ou outros erros comuns que não são BaseError mas tem status
  if ('statusCode' in err || 'status' in err) {
    const statusCode = (err as any).statusCode || (err as any).status || 400;
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
