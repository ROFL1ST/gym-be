import { Router } from 'express';
import { recommendWorkout, recommendMeal, generateWorkoutPlan } from './ai.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate';
import { recommendWorkoutSchema, recommendMealSchema, generateWorkoutPlanSchema } from './ai.validation';

const router = Router();

// Endpoint AI bisa diakses dengan token atau publik dengan payload lengkap
router.post('/recommend-workout', authenticate, validate(recommendWorkoutSchema), recommendWorkout);
router.post('/recommend-meal', authenticate, validate(recommendMealSchema), recommendMeal);

// Generate 7-day workout plan via AI eksternal → auto-save ke schedules
router.post('/generate-workout-plan', authenticate, validate(generateWorkoutPlanSchema), generateWorkoutPlan);

export default router;
