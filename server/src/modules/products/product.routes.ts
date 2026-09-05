import { Router } from 'express';
import { productController } from './product.controller';
import { authenticateAdmin } from '../../common/middleware/auth.middleware';
import { requirePermissions } from '../../common/middleware/rbac.middleware';
import { validateRequest } from '../../common/middleware/validate.middleware';
import { Permission } from '../../common/constants';
import { createProductSchema, updateProductSchema, productQuerySchema } from './product.validation';

const router = Router();

router.get('/', validateRequest(productQuerySchema, 'query'), productController.getProducts);
router.get('/:id', productController.getProductById);

router.post(
  '/',
  authenticateAdmin,
  requirePermissions(Permission.PRODUCT_CREATE),
  validateRequest(createProductSchema, 'body'),
  productController.createProduct
);

router.patch(
  '/:id',
  authenticateAdmin,
  requirePermissions(Permission.PRODUCT_UPDATE),
  validateRequest(updateProductSchema, 'body'),
  productController.updateProduct
);

router.patch(
  '/:id/status',
  authenticateAdmin,
  requirePermissions(Permission.PRODUCT_UPDATE),
  productController.updateStatus
);

router.delete(
  '/:id',
  authenticateAdmin,
  requirePermissions(Permission.PRODUCT_DELETE),
  productController.deleteProduct
);

export const productRoutes = router;
