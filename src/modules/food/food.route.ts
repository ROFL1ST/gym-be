import { Router } from 'express';
import { getFoods, getFoodById, createFood } from './food.controller';
import { validate } from '../../middlewares/validate';
import { createFoodSchema } from './food.validation';

const router = Router();

router.get('/', getFoods);
router.get('/:id', getFoodById);
router.post('/', validate(createFoodSchema), createFood);

export default router;
