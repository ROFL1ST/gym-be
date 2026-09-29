import { z } from 'zod';

export const createWorkoutHistorySchema = z.object({
  schedule_id: z.string().uuid().nullable().optional(),
  focus_muscle: z.string().min(2, 'Focus muscle wajib diisi').max(100),
  duration_minutes: z.number().int().positive('Durasi harus lebih dari 0 menit'),
  notes: z.string().optional(),
});
