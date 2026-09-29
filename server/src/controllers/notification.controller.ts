import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getNotifications = async (
  req: Request & { userId?: string },
  res: Response,
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const unreadCount = notifications.filter(
      (notification) => !notification.read,
    ).length;

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load notifications",
    });
  }
};

export const markNotificationAsRead = async (
  req: Request<{ id: string }> & { userId?: string },
  res: Response,
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        read: true,
      },
    });

    return res.json({
      success: true,
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Mark notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark notification as read",
    });
  }
};
