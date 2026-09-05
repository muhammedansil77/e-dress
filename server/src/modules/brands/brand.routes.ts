import { Router } from 'express';
import { brandController } from './brand.controller';
import { authenticateAdmin } from '../../common/middleware/auth.middleware';
import { validateRequest } from '../../common/middleware/validate.middleware';
import { createBrandSchema, updateBrandSchema } from './brand.validation';

const router = Router();

router.get('/', brandController.getBrands);
router.get('/active', brandController.getActiveBrands);
router.get('/:id', brandController.getBrandById);

router.post('/', authenticateAdmin, validateRequest(createBrandSchema), brandController.createBrand);
router.patch('/:id', authenticateAdmin, validateRequest(updateBrandSchema), brandController.updateBrand);
router.delete('/:id', authenticateAdmin, brandController.deleteBrand);

export const brandRoutes = router;
