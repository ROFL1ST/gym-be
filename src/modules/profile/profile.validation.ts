import { z } from 'zod';

export const upsertProfileSchema = z.object({
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender harus "male" atau "female"' }),
  }),
  age: z.number().int().min(10, 'Usia minimal 10 tahun').max(120, 'Usia maksimal 120 tahun'),
  weight: z.number().positive('Berat badan harus angka positif'),
  height: z.number().positive('Tinggi badan harus angka positif'),
  fitness_level: z.enum(['easy', 'medium', 'intermediate'], {
    errorMap: () => ({ message: 'Fitness level harus "easy", "medium", atau "intermediate"' }),
  }),
  fitness_goal: z.enum(['lose', 'gain', 'healthy'], {
    errorMap: () => ({ message: 'Fitness goal harus "lose", "gain", atau "healthy"' }),
  }),
});
