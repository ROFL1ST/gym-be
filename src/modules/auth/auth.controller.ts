import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/password.util';
import { generateToken } from '../../utils/jwt.util';
import { sendSuccess, sendError } from '../../utils/response.util';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(res, 409, 'Email sudah terdaftar. Silakan gunakan email lain atau login.');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        streak: {
          create: {
            currentStreak: 0,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return sendSuccess(
      res,
      201,
      'Registrasi berhasil!',
      {
        user,
        token,
      }
    );
  } catch (error: any) {
    console.error('Error register:', error);
    return sendError(res, 500, 'Terjadi kesalahan pada server saat registrasi.');
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        streak: true,
      },
    });

    if (!user) {
      return sendError(res, 401, 'Email atau password salah.');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Email atau password salah.');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const { password: _, ...userWithoutPassword } = user;

    return sendSuccess(res, 200, 'Login berhasil!', {
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error('Error login:', error);
    return sendError(res, 500, 'Terjadi kesalahan pada server saat login.');
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: true,
        streak: true,
      },
    });

    if (!user) {
      return sendError(res, 404, 'Pengguna tidak ditemukan.');
    }

    return sendSuccess(res, 200, 'Data profil pengguna berhasil diambil.', user);
  } catch (error: any) {
    console.error('Error getMe:', error);
    return sendError(res, 500, 'Terjadi kesalahan pada server saat mengambil data pengguna.');
  }
}
