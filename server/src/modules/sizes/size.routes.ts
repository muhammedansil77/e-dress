import { Router } from 'express';
import { sizeController } from './size.controller';
import { authenticateAdmin } from '../../common/middleware/auth.middleware';

const router = Router();

router.get('/', sizeController.getSizes);
router.get('/active', sizeController.getActiveSizes);
router.post('/', authenticateAdmin, sizeController.createSize);

export const sizeRoutes = router;
