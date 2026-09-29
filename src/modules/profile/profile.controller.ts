import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response.util';

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return sendSuccess(res, 200, 'Profil pengguna belum diisi.', null);
    }

    return sendSuccess(res, 200, 'Profil pengguna berhasil diambil.', profile);
  } catch (error: any) {
    console.error('Error getProfile:', error);
    return sendError(res, 500, 'Gagal mengambil data profil.');
  }
}

export async function upsertProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { gender, age, weight, height, fitness_level, fitness_goal } = req.body;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        gender,
        age,
        weight,
        height,
        fitnessLevel: fitness_level,
        fitnessGoal: fitness_goal,
      },
      create: {
        userId,
        gender,
        age,
        weight,
        height,
        fitnessLevel: fitness_level,
        fitnessGoal: fitness_goal,
      },
    });

    return sendSuccess(res, 200, 'Profil berhasil diperbarui!', profile);
  } catch (error: any) {
    console.error('Error upsertProfile:', error);
    return sendError(res, 500, 'Gagal memperbarui profil pengguna.');
  }
}
