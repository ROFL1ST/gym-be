import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response.util';

export async function getMealPlans(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { date } = req.query;

    const whereClause: any = { userId };
    if (date) {
      whereClause.date = new Date(date as string);
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: whereClause,
      include: {
        details: {
          include: {
            food: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Kalkulasi ringkasan makronutrien total
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    mealPlans.forEach((plan) => {
      plan.details.forEach((item) => {
        totalCalories += Number(item.calculatedCalories);
        totalProtein += Number(item.calculatedProtein);
        totalCarbs += Number(item.calculatedCarbs);
        totalFat += Number(item.calculatedFat);
      });
    });

    return sendSuccess(res, 200, 'Data pola makan berhasil diambil.', mealPlans, {
      summary: {
        totalCalories: Math.round(totalCalories * 10) / 10,
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
      },
    });
  } catch (error: any) {
    console.error('Error getMealPlans:', error);
    return sendError(res, 500, 'Gagal mengambil data pola makan.');
  }
}

export async function createMealPlan(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { date, meal_type, target_calories, is_ai_generated, ai_notes } = req.body;

    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId,
        date: new Date(date),
        mealType: meal_type,
        targetCalories: target_calories,
        isAiGenerated: is_ai_generated || false,
        aiNotes: ai_notes || null,
      },
    });

    return sendSuccess(res, 201, 'Meal plan berhasil dibuat!', mealPlan);
  } catch (error: any) {
    console.error('Error createMealPlan:', error);
    return sendError(res, 500, 'Gagal membuat meal plan.');
  }
}

export async function addMealPlanDetail(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const {
      food_id,
      food_name_custom,
      portion_g,
      calculated_calories,
      calculated_protein,
      calculated_carbs,
      calculated_fat,
      calculated_sugar,
      calculated_fiber,
    } = req.body;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id, userId },
    });

    if (!mealPlan) {
      return sendError(res, 404, 'Meal plan tidak ditemukan.');
    }

    let finalCalories = calculated_calories;
    let finalProtein = calculated_protein;
    let finalCarbs = calculated_carbs;
    let finalFat = calculated_fat;
    let finalSugar = calculated_sugar ?? 0;
    let finalFiber = calculated_fiber ?? 0;

    // Jika mengacu ke master food dan belum ada kalkulasi manual, hitung otomatis berdasarkan rasio porsi gram
    if (food_id && (finalCalories === undefined || finalProtein === undefined)) {
      const food = await prisma.food.findUnique({
        where: { id: food_id },
      });

      if (!food) {
        return sendError(res, 404, 'Master makanan tidak ditemukan.');
      }

      const ratio = portion_g / Number(food.servingSizeG);
      finalCalories = Math.round(Number(food.calories) * ratio * 10) / 10;
      finalProtein = Math.round(Number(food.proteinG) * ratio * 10) / 10;
      finalCarbs = Math.round(Number(food.carbsG) * ratio * 10) / 10;
      finalFat = Math.round(Number(food.fatG) * ratio * 10) / 10;
      finalSugar = Math.round(Number(food.sugarG) * ratio * 10) / 10;
      finalFiber = Math.round(Number(food.fiberG) * ratio * 10) / 10;
    }

    const detail = await prisma.mealPlanDetail.create({
      data: {
        mealPlanId: id,
        foodId: food_id || null,
        foodNameCustom: food_name_custom || null,
        portionG: portion_g,
        calculatedCalories: finalCalories || 0,
        calculatedProtein: finalProtein || 0,
        calculatedCarbs: finalCarbs || 0,
        calculatedFat: finalFat || 0,
        calculatedSugar: finalSugar || 0,
        calculatedFiber: finalFiber || 0,
      },
      include: {
        food: true,
      },
    });

    return sendSuccess(res, 201, 'Item makanan berhasil ditambahkan ke meal plan!', detail);
  } catch (error: any) {
    console.error('Error addMealPlanDetail:', error);
    return sendError(res, 500, 'Gagal menambahkan detail makanan.');
  }
}

export async function deleteMealPlanDetail(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const detailId = req.params.detailId as string;

    // Pastikan mealPlan milik user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id, userId },
    });

    if (!mealPlan) {
      return sendError(res, 404, 'Meal plan tidak ditemukan.');
    }

    await prisma.mealPlanDetail.delete({
      where: { id: detailId, mealPlanId: id },
    });

    return sendSuccess(res, 200, 'Item makanan berhasil dihapus dari meal plan.');
  } catch (error: any) {
    console.error('Error deleteMealPlanDetail:', error);
    return sendError(res, 500, 'Gagal menghapus item makanan.');
  }
}
