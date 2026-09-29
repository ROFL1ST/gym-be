import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response.util';

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [user, profile, streak, todaySchedules, todayMeals, recentWorkouts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
      }),
      prisma.userStreak.findUnique({
        where: { userId },
      }),
      prisma.schedule.findMany({
        where: {
          userId,
          scheduledDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.mealPlan.findMany({
        where: {
          userId,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          details: true,
        },
      }),
      prisma.workoutHistory.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 5,
        include: {
          schedule: {
            select: { title: true, isAiGenerated: true },
          },
        },
      }),
    ]);

    // Hitung total kalori hari ini
    let targetCaloriesTotal = 0;
    let consumedCaloriesTotal = 0;

    todayMeals.forEach((meal) => {
      targetCaloriesTotal += meal.targetCalories;
      meal.details.forEach((detail) => {
        consumedCaloriesTotal += Number(detail.calculatedCalories);
      });
    });

    return sendSuccess(res, 200, 'Data dashboard berhasil diambil.', {
      user,
      profile,
      streak: streak || { currentStreak: 0, lastActivityDate: null },
      todaySchedules,
      todayCalories: {
        target: targetCaloriesTotal,
        consumed: Math.round(consumedCaloriesTotal * 10) / 10,
        remaining: Math.max(0, Math.round((targetCaloriesTotal - consumedCaloriesTotal) * 10) / 10),
      },
      recentWorkouts,
    });
  } catch (error: any) {
    console.error('Error getDashboardSummary:', error);
    return sendError(res, 500, 'Gagal mengambil data ringkasan dashboard.');
  }
}
