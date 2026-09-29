import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { generateWorkoutRecommendation, generateMealRecommendation } from './ai.service';
import { sendSuccess, sendError } from '../../utils/response.util';

export async function recommendWorkout(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    let fitnessLevel = req.body.fitness_level;
    let fitnessGoal = req.body.fitness_goal;
    let lastWorkoutFocus = req.body.last_workout_focus;

    // Ambil data profil jika input di request body tidak lengkap
    if (userId && (!fitnessLevel || !fitnessGoal)) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
      });
      if (profile) {
        if (!fitnessLevel) fitnessLevel = profile.fitnessLevel;
        if (!fitnessGoal) fitnessGoal = profile.fitnessGoal;
      }
    }

    // Ambil histori latihan terakhir jika ada
    if (userId && !lastWorkoutFocus) {
      const lastHistory = await prisma.workoutHistory.findFirst({
        where: { userId },
        orderBy: { completedAt: 'desc' },
      });
      if (lastHistory) {
        lastWorkoutFocus = lastHistory.focusMuscle;
      }
    }

    // Default values jika profil belum diisi sama sekali
    fitnessLevel = fitnessLevel || 'medium';
    fitnessGoal = fitnessGoal || 'healthy';

    const recommendation = await generateWorkoutRecommendation({
      fitnessLevel,
      fitnessGoal,
      lastWorkoutFocus,
      targetDate: req.body.target_date,
    });

    return sendSuccess(res, 200, 'Rekomendasi latihan AI berhasil dibuat!', recommendation);
  } catch (error: any) {
    console.error('Error recommendWorkout:', error);
    return sendError(res, 500, 'Gagal membuat rekomendasi latihan AI.');
  }
}

export async function recommendMeal(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    let weight = req.body.weight;
    let height = req.body.height;
    let age = req.body.age;
    let gender = req.body.gender;
    let fitnessGoal = req.body.fitness_goal;
    let fitnessLevel = req.body.fitness_level;

    if (userId && (!weight || !height || !age || !gender || !fitnessGoal)) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
      });
      if (profile) {
        weight = weight || Number(profile.weight);
        height = height || Number(profile.height);
        age = age || profile.age;
        gender = gender || profile.gender;
        fitnessGoal = fitnessGoal || profile.fitnessGoal;
        fitnessLevel = fitnessLevel || profile.fitnessLevel;
      }
    }

    // Fallback default
    weight = weight || 70;
    height = height || 170;
    age = age || 22;
    gender = gender || 'male';
    fitnessGoal = fitnessGoal || 'healthy';
    fitnessLevel = fitnessLevel || 'medium';

    const recommendation = await generateMealRecommendation({
      weight,
      height,
      age,
      gender,
      fitnessGoal,
      fitnessLevel,
    });

    return sendSuccess(res, 200, 'Rekomendasi pola makan & nutrisi AI berhasil dihitung!', recommendation);
  } catch (error: any) {
    console.error('Error recommendMeal:', error);
    return sendError(res, 500, 'Gagal menghitung rekomendasi pola makan AI.');
  }
}
