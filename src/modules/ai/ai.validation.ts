import { z } from 'zod';

export const recommendWorkoutSchema = z.object({
  fitness_level: z.enum(['easy', 'medium', 'intermediate']).optional(),
  fitness_goal: z.enum(['lose', 'gain', 'healthy']).optional(),
  last_workout_focus: z.string().optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const recommendMealSchema = z.object({
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  age: z.number().int().min(10).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  fitness_goal: z.enum(['lose', 'gain', 'healthy']).optional(),
  fitness_level: z.enum(['easy', 'medium', 'intermediate']).optional(),
  workout_intensity: z.enum(['low', 'moderate', 'high']).optional(),
});

// Schema untuk endpoint generate-workout-plan (panggil AI eksternal)
export const generateWorkoutPlanSchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional(),
  save_to_schedule: z.boolean().optional().default(true),
});
