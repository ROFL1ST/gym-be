import { z } from 'zod';

export const createMealPlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    errorMap: () => ({ message: 'Meal type harus "breakfast", "lunch", "dinner", atau "snack"' }),
  }),
  target_calories: z.number().int().positive('Target kalori harus angka positif'),
  is_ai_generated: z.boolean().optional().default(false),
  ai_notes: z.string().optional(),
});

export const addMealDetailSchema = z.object({
  food_id: z.string().uuid().nullable().optional(),
  food_name_custom: z.string().max(255).nullable().optional(),
  portion_g: z.number().positive('Porsi harus lebih dari 0 gram'),
  calculated_calories: z.number().nonnegative().optional(),
  calculated_protein: z.number().nonnegative().optional(),
  calculated_carbs: z.number().nonnegative().optional(),
  calculated_fat: z.number().nonnegative().optional(),
  calculated_sugar: z.number().nonnegative().optional().default(0),
  calculated_fiber: z.number().nonnegative().optional().default(0),
}).refine((data) => data.food_id || data.food_name_custom, {
  message: 'Harus menyertakan food_id atau food_name_custom',
});
