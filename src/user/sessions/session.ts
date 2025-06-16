import { PrismaService } from 'src/prisma/prisma.service';
const prisma = new PrismaService();
export async function createSession(userId: string, expiredAt: Date) {
  const session = await prisma.session.create({
    data: {
      userId: userId,
      expires: expiredAt,
    },
  });
  const { id, expires } = session;
  return { id, expires };
}

export async function updateSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: { Session: true },
  });
  const session = user?.Session[user.Session.length - 1];

  if (session) {
    const sessions = await prisma.session.update({
      where: {
        id: session?.id,
      },
      data: {
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    });
    const { id, expires } = sessions;
    return { id, expires };
  }
  return null;
}
