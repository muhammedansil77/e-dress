import './common/types/express';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.config';
import { errorHandler } from './common/middleware/error.middleware';
import { NotFoundError } from './common/errors/app-error';
import { ApiResponse } from './common/utils/api-response';

// Feature Routes
import { authRoutes } from './modules/auth/auth.routes';
import { categoryRoutes } from './modules/categories/category.routes';
import { productRoutes } from './modules/products/product.routes';
import { brandRoutes } from './modules/brands/brand.routes';
import { sizeRoutes } from './modules/sizes/size.routes';
import { colorRoutes } from './modules/colors/color.routes';

export const createApp = (): Application => {
  const app = express();

  // 1. Security Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (env.CORS_ORIGINS.includes(origin) || env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        callback(new Error(`CORS error: Origin ${origin} not permitted`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 2. Request Parsing & Compression
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // 3. Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // 4. Base Health Check
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    return ApiResponse.success(res, {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    }, 'Server health is optimal');
  });

  // 5. Mount Feature Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/brands', brandRoutes);
  app.use('/api/v1/sizes', sizeRoutes);
  app.use('/api/v1/colors', colorRoutes);

  // 6. Handle 404 Routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
  });

  // 7. Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
