import { Router } from 'express';
import { getStreak, checkInStreak } from './streak.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getStreak);
router.post('/check-in', checkInStreak);

export default router;
