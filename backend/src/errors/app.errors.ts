export class BaseError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400);
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
