import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response.util';

export async function getSchedules(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { start_date, end_date, date, status } = req.query;

    const whereClause: any = { userId };

    if (date) {
      whereClause.scheduledDate = new Date(date as string);
    } else if (start_date || end_date) {
      whereClause.scheduledDate = {};
      if (start_date) whereClause.scheduledDate.gte = new Date(start_date as string);
      if (end_date) whereClause.scheduledDate.lte = new Date(end_date as string);
    }

    if (status) {
      whereClause.status = status;
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      orderBy: { scheduledDate: 'asc' },
      include: {
        workoutHistories: true,
      },
    });

    return sendSuccess(res, 200, 'Data jadwal berhasil diambil.', schedules);
  } catch (error: any) {
    console.error('Error getSchedules:', error);
    return sendError(res, 500, 'Gagal mengambil data jadwal.');
  }
}

export async function createSchedule(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { title, scheduled_date, focus_muscle, status, is_ai_generated, ai_notes } = req.body;

    const schedule = await prisma.schedule.create({
      data: {
        userId,
        title,
        scheduledDate: new Date(scheduled_date),
        focusMuscle: focus_muscle,
        status: status || 'pending',
        isAiGenerated: is_ai_generated || false,
        aiNotes: ai_notes || null,
      },
    });

    return sendSuccess(res, 201, 'Jadwal latihan berhasil dibuat!', schedule);
  } catch (error: any) {
    console.error('Error createSchedule:', error);
    return sendError(res, 500, 'Gagal membuat jadwal latihan.');
  }
}

export async function updateSchedule(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const { title, scheduled_date, focus_muscle, status, ai_notes } = req.body;

    const existing = await prisma.schedule.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return sendError(res, 404, 'Jadwal tidak ditemukan.');
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(scheduled_date !== undefined && { scheduledDate: new Date(scheduled_date) }),
        ...(focus_muscle !== undefined && { focusMuscle: focus_muscle }),
        ...(status !== undefined && { status }),
        ...(ai_notes !== undefined && { aiNotes: ai_notes }),
      },
    });

    return sendSuccess(res, 200, 'Jadwal berhasil diperbarui.', updated);
  } catch (error: any) {
    console.error('Error updateSchedule:', error);
    return sendError(res, 500, 'Gagal memperbarui jadwal.');
  }
}

export async function deleteSchedule(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const existing = await prisma.schedule.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return sendError(res, 404, 'Jadwal tidak ditemukan.');
    }

    await prisma.schedule.delete({
      where: { id },
    });

    return sendSuccess(res, 200, 'Jadwal berhasil dihapus.');
  } catch (error: any) {
    console.error('Error deleteSchedule:', error);
    return sendError(res, 500, 'Gagal menghapus jadwal.');
  }
}
