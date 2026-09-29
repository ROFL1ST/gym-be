import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response.util';

export async function getFoods(req: Request, res: Response) {
  try {
    const { search, category } = req.query;

    const whereClause: any = {};

    if (search) {
      whereClause.name = {
        contains: String(search),
        mode: 'insensitive',
      };
    }

    if (category) {
      whereClause.category = {
        contains: String(category),
        mode: 'insensitive',
      };
    }

    const foods = await prisma.food.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, 200, 'Daftar makanan berhasil diambil.', foods);
  } catch (error: any) {
    console.error('Error getFoods:', error);
    return sendError(res, 500, 'Gagal mengambil daftar makanan.');
  }
}

export async function getFoodById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const food = await prisma.food.findUnique({
      where: { id },
    });

    if (!food) {
      return sendError(res, 404, 'Makanan tidak ditemukan.');
    }

    return sendSuccess(res, 200, 'Detail makanan berhasil diambil.', food);
  } catch (error: any) {
    console.error('Error getFoodById:', error);
    return sendError(res, 500, 'Gagal mengambil detail makanan.');
  }
}

export async function createFood(req: Request, res: Response) {
  try {
    const {
      name,
      category,
      serving_size_g,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      sugar_g,
      fiber_g,
    } = req.body;

    const food = await prisma.food.create({
      data: {
        name,
        category,
        servingSizeG: serving_size_g,
        calories,
        proteinG: protein_g,
        carbsG: carbs_g,
        fatG: fat_g,
        sugarG: sugar_g ?? 0,
        fiberG: fiber_g ?? 0,
      },
    });

    return sendSuccess(res, 201, 'Makanan berhasil ditambahkan ke database.', food);
  } catch (error: any) {
    console.error('Error createFood:', error);
    return sendError(res, 500, 'Gagal menambahkan makanan.');
  }
}
