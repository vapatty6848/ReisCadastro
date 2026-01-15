export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401);
  }
}

export class NotFoundError extends BaseError {
  constructor(entity: string) {
    super(`${entity} não encontrado(a)`, 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message, 409);
  }
}
