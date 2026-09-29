import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import {
  generateWorkoutRecommendation,
  generateMealRecommendation,
  callExternalWorkoutAI,
  saveWorkoutPlanToSchedules,
} from './ai.service';
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

/**
 * POST /api/ai/generate-workout-plan
 * Panggil AI Workout eksternal → kembalikan jadwal 7 hari + simpan ke schedules.
 */
export async function generateWorkoutPlan(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { start_date, save_to_schedule = true } = req.body;

    // 1. Ambil profil user dari DB
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      return sendError(res, 422, 'Profil belum lengkap. Isi profil terlebih dahulu sebelum generate jadwal.');
    }

    // 2. Ambil histori latihan 30 hari terakhir sebagai context untuk AI
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workoutHistories = await prisma.workoutHistory.findMany({
      where: { userId, completedAt: { gte: thirtyDaysAgo } },
      orderBy: { completedAt: 'desc' },
      select: { focusMuscle: true, completedAt: true },
    });

    const history = workoutHistories.map((h) => ({
      focus_muscle: h.focusMuscle,
      completed_at: h.completedAt.toISOString().split('T')[0], // format YYYY-MM-DD
    }));

    // 3. Panggil AI eksternal
    const aiResponse = await callExternalWorkoutAI({
      fitnessLevel: profile.fitnessLevel,
      fitnessGoal: profile.fitnessGoal,
      age: profile.age,
      gender: profile.gender,
      weight: Number(profile.weight),
      height: Number(profile.height),
      history,
      startDate: start_date,
    });

    const workoutPlan = aiResponse.workout_plan ?? [];

    // 4. Simpan ke schedules jika diminta
    let savedSchedules: any[] = [];
    if (save_to_schedule) {
      savedSchedules = await saveWorkoutPlanToSchedules(userId, workoutPlan);
    }

    return sendSuccess(res, 200, 'Jadwal latihan 7 hari berhasil dibuat oleh AI!', {
      workout_plan: workoutPlan,
      saved_schedules_count: savedSchedules.length,
      saved_schedules: savedSchedules,
    });
  } catch (error: any) {
    console.error('Error generateWorkoutPlan:', error);

    // Timeout atau koneksi ke AI eksternal gagal
    if (error.name === 'TimeoutError' || error.message?.includes('fetch')) {
      return sendError(res, 503, 'AI Workout sedang tidak tersedia. Coba lagi dalam beberapa saat.');
    }

    return sendError(res, 500, 'Gagal membuat jadwal latihan AI.', error.message);
  }
}

