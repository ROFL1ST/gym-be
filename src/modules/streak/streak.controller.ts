import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { recordUserActivity } from './streak.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export async function getStreak(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const streak = await prisma.userStreak.findUnique({
      where: { userId },
    });

    return sendSuccess(res, 200, 'Data streak berhasil diambil.', streak || { currentStreak: 0, lastActivityDate: null });
  } catch (error: any) {
    console.error('Error getStreak:', error);
    return sendError(res, 500, 'Gagal mengambil data streak.');
  }
}

export async function checkInStreak(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const streak = await recordUserActivity(userId);

    return sendSuccess(res, 200, 'Check-in berhasil dicatat!', streak);
  } catch (error: any) {
    console.error('Error checkInStreak:', error);
    return sendError(res, 500, 'Gagal melakukan check-in streak.');
  }
}
