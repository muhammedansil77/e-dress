import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../common/middleware/validate.middleware';
import { authenticateAdmin } from '../../common/middleware/auth.middleware';
import { adminLoginSchema, refreshTokenSchema } from './auth.validation';

const router = Router();

router.post(
  '/admin/login',
  validateRequest(adminLoginSchema, 'body'),
  authController.login
);

router.post(
  '/admin/refresh-token',
  validateRequest(refreshTokenSchema, 'body'),
  authController.refreshToken
);

router.post(
  '/admin/logout',
  authenticateAdmin,
  authController.logout
);

router.get(
  '/admin/me',
  authenticateAdmin,
  authController.getProfile
);

export const authRoutes = router;
