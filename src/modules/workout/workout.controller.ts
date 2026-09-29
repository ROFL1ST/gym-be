import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { recordUserActivity } from '../streak/streak.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export async function getWorkoutHistories(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(1, parseInt((req.query.limit as string) || '10', 10));
    const skip = (page - 1) * limit;

    const [histories, total] = await Promise.all([
      prisma.workoutHistory.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
        include: {
          schedule: {
            select: {
              id: true,
              title: true,
              isAiGenerated: true,
            },
          },
        },
      }),
      prisma.workoutHistory.count({ where: { userId } }),
    ]);

    return sendSuccess(res, 200, 'Riwayat latihan berhasil diambil.', histories, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error getWorkoutHistories:', error);
    return sendError(res, 500, 'Gagal mengambil riwayat latihan.');
  }
}

export async function createWorkoutHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { schedule_id, focus_muscle, duration_minutes, notes } = req.body;

    const history = await prisma.$transaction(async (tx) => {
      // 1. Simpan riwayat latihan
      const newHistory = await tx.workoutHistory.create({
        data: {
          userId,
          scheduleId: schedule_id || null,
          focusMuscle: focus_muscle,
          durationMinutes: duration_minutes,
          notes: notes || null,
        },
      });

      // 2. Jika scheduleId ada, ubah status schedule menjadi completed
      if (schedule_id) {
        await tx.schedule.updateMany({
          where: { id: schedule_id, userId },
          data: { status: 'completed' },
        });
      }

      return newHistory;
    });

    // 3. Update streak secara otomatis
    const updatedStreak = await recordUserActivity(userId);

    return sendSuccess(res, 201, 'Latihan berhasil dicatat dan streak diperbarui!', {
      workout: history,
      streak: updatedStreak,
    });
  } catch (error: any) {
    console.error('Error createWorkoutHistory:', error);
    return sendError(res, 500, 'Gagal mencatat latihan.');
  }
}
