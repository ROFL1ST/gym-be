import { Router, Request, Response } from 'express';
import { prisma } from '../config/db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = `disconnected (${(error as Error).message})`;
  }

  res.json({
    status: 'ok',
    service: 'Smart Gym Backend API',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

export default router;
