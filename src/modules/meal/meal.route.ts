import { Router } from 'express';
import {
  getMealPlans,
  createMealPlan,
  addMealPlanDetail,
  deleteMealPlanDetail,
} from './meal.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate';
import { createMealPlanSchema, addMealDetailSchema } from './meal.validation';

const router = Router();

router.use(authenticate);

router.get('/', getMealPlans);
router.post('/', validate(createMealPlanSchema), createMealPlan);
router.post('/:id/details', validate(addMealDetailSchema), addMealPlanDetail);
router.delete('/:id/details/:detailId', deleteMealPlanDetail);

export default router;
