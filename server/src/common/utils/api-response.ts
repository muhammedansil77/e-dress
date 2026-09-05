import { Response } from 'express';
import { HttpStatus, HttpStatusCode } from '../constants/http-status';

export interface ApiResponseFormat<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
  errors?: any[];
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode: HttpStatusCode = HttpStatus.OK,
    meta?: Record<string, any>
  ): Response {
    const payload: ApiResponseFormat<T> = {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    };
    return res.status(statusCode).json(payload);
  }

  public static created<T>(res: Response, data: T, message = 'Resource created successfully'): Response {
    return this.success(res, data, message, HttpStatus.CREATED);
  }

  public static error(
    res: Response,
    message = 'Something went wrong',
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errors: any[] = []
  ): Response {
    const payload: ApiResponseFormat = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(payload);
  }
}
