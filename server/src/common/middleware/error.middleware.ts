import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error';
import { HttpStatus } from '../constants/http-status';
import { env } from '../../config/env.config';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} ('${err.keyValue?.[field]}') already exists.`;
    errors = [{ field, message }];
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = `Invalid format for identifier '${err.value}'`;
    errors = [{ field: err.path, message }];
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    message = 'Data validation failed';
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Authentication token has expired';
  }

  // Hide stack trace and unhandled error details in production
  if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR && env.NODE_ENV === 'production') {
    message = 'An unexpected internal error occurred';
    errors = [];
  }

  if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
    console.error('💥 Unhandled Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
