import { Router } from 'express';
import { getDashboardSummary } from './dashboard.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getDashboardSummary);

export default router;
