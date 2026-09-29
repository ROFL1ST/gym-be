import { Router } from 'express';
import { recommendWorkout, recommendMeal } from './ai.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate';
import { recommendWorkoutSchema, recommendMealSchema } from './ai.validation';

const router = Router();

// Endpoint AI bisa diakses dengan token atau publik dengan payload lengkap
router.post('/recommend-workout', authenticate, validate(recommendWorkoutSchema), recommendWorkout);
router.post('/recommend-meal', authenticate, validate(recommendMealSchema), recommendMeal);

export default router;
