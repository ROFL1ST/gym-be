import { Router } from 'express';
import healthRoute from './health.route';
import authRoute from '../modules/auth/auth.route';
import profileRoute from '../modules/profile/profile.route';
import streakRoute from '../modules/streak/streak.route';
import scheduleRoute from '../modules/schedule/schedule.route';
import workoutRoute from '../modules/workout/workout.route';
import foodRoute from '../modules/food/food.route';
import mealRoute from '../modules/meal/meal.route';
import dashboardRoute from '../modules/dashboard/dashboard.route';
import aiRoute from '../modules/ai/ai.route';

const router = Router();

router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/profile', profileRoute);
router.use('/streaks', streakRoute);
router.use('/schedules', scheduleRoute);
router.use('/workouts', workoutRoute);
router.use('/foods', foodRoute);
router.use('/meals', mealRoute);
router.use('/dashboard', dashboardRoute);
router.use('/ai', aiRoute);

export default router;
