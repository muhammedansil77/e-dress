import { Router } from 'express';
import { colorController } from './color.controller';
import { authenticateAdmin } from '../../common/middleware/auth.middleware';

const router = Router();

router.get('/', colorController.getColors);
router.get('/active', colorController.getActiveColors);
router.post('/', authenticateAdmin, colorController.createColor);

export const colorRoutes = router;
