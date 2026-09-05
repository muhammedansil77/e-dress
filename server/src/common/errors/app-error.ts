import { HttpStatus, HttpStatusCode } from '../constants/http-status';

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly errors?: any[];

  constructor(message: string, statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors?: any[]) {
    super(message, HttpStatus.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized: Authentication required') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden: You do not have permission to perform this action') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict: Resource already exists') {
    super(message, HttpStatus.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors?: any[]) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, errors);
  }
}
