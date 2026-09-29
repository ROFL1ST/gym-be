import { z } from 'zod';

export const createScheduleSchema = z.object({
  title: z.string().min(2, 'Judul minimal 2 karakter').max(255),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  focus_muscle: z.string().min(2, 'Focus muscle wajib diisi').max(100),
  status: z.enum(['pending', 'completed', 'cancelled']).optional().default('pending'),
  is_ai_generated: z.boolean().optional().default(false),
  ai_notes: z.string().optional(),
});

export const updateScheduleSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  focus_muscle: z.string().min(2).max(100).optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  ai_notes: z.string().optional(),
});
