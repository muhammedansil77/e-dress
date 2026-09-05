import { Router } from 'express';
import { categoryController } from './category.controller';
import { authenticateAdmin } from '../../common/middleware/auth.middleware';
import { requirePermissions } from '../../common/middleware/rbac.middleware';
import { validateRequest } from '../../common/middleware/validate.middleware';
import { Permission } from '../../common/constants';
import {
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
  categoryQuerySchema,
  categoryIdParamSchema,
} from './category.validation';

const router = Router();

// Public / Read Routes
router.get(
  '/',
  validateRequest(categoryQuerySchema, 'query'),
  categoryController.getCategories
);

router.get('/tree', categoryController.getCategoryTree);
router.get('/active', categoryController.getActiveCategories);

router.get(
  '/:id',
  validateRequest(categoryIdParamSchema, 'params'),
  categoryController.getCategoryById
);

// Protected Admin Routes (with RBAC Permissions)
router.post(
  '/',
  authenticateAdmin,
  requirePermissions(Permission.CATEGORY_CREATE),
  validateRequest(createCategorySchema, 'body'),
  categoryController.createCategory
);

router.patch(
  '/:id',
  authenticateAdmin,
  requirePermissions(Permission.CATEGORY_UPDATE),
  validateRequest(categoryIdParamSchema, 'params'),
  validateRequest(updateCategorySchema, 'body'),
  categoryController.updateCategory
);

router.patch(
  '/:id/status',
  authenticateAdmin,
  requirePermissions(Permission.CATEGORY_UPDATE),
  validateRequest(categoryIdParamSchema, 'params'),
  validateRequest(updateCategoryStatusSchema, 'body'),
  categoryController.updateCategoryStatus
);

router.delete(
  '/:id',
  authenticateAdmin,
  requirePermissions(Permission.CATEGORY_DELETE),
  validateRequest(categoryIdParamSchema, 'params'),
  categoryController.deleteCategory
);

export const categoryRoutes = router;
