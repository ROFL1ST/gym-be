import { prisma } from '../../config/db';

export async function recordUserActivity(userId: string) {
  const streakRecord = await prisma.userStreak.findUnique({
    where: { userId },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!streakRecord) {
    return prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        lastActivityDate: today,
      },
    });
  }

  if (streakRecord.lastActivityDate) {
    const lastDate = new Date(streakRecord.lastActivityDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Sudah tercatat hari ini
      return streakRecord;
    } else if (diffDays === 1) {
      // Berkelanjutan hari berikutnya -> streak + 1
      return prisma.userStreak.update({
        where: { userId },
        data: {
          currentStreak: streakRecord.currentStreak + 1,
          lastActivityDate: today,
        },
      });
    }
  }

  // Jika putus lebih dari 1 hari atau belum pernah ada aktivitas
  return prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: 1,
      lastActivityDate: today,
    },
  });
}
