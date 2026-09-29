import { Router } from 'express';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from './schedule.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate';
import { createScheduleSchema, updateScheduleSchema } from './schedule.validation';

const router = Router();

router.use(authenticate);

router.get('/', getSchedules);
router.post('/', validate(createScheduleSchema), createSchedule);
router.patch('/:id', validate(updateScheduleSchema), updateSchedule);
router.delete('/:id', deleteSchedule);

export default router;
