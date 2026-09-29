import { Router } from 'express';
import { getWorkoutHistories, createWorkoutHistory } from './workout.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate';
import { createWorkoutHistorySchema } from './workout.validation';

const router = Router();

router.use(authenticate);

router.get('/histories', getWorkoutHistories);
router.post('/histories', validate(createWorkoutHistorySchema), createWorkoutHistory);

export default router;
