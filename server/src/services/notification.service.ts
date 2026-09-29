import prisma from "../config/prisma";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
}

export const createNotification = async ({
  userId,
  title,
  message,
}: CreateNotificationParams) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
};
