import { z } from 'zod';

export const createFoodSchema = z.object({
  name: z.string().min(2, 'Nama makanan minimal 2 karakter').max(255),
  category: z.string().min(2, 'Kategori wajib diisi').max(100),
  serving_size_g: z.number().positive('Ukuran porsi harus positif'),
  calories: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
  sugar_g: z.number().nonnegative().optional().default(0),
  fiber_g: z.number().nonnegative().optional().default(0),
});
