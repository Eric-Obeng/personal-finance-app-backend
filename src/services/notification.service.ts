import Notification from "../models/notification";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationPayload {
  message: string;
  type: NotificationType;
  relatedId?: string;
  category?: string;
}

class NotificationService {
  /**
   * Create and save a notification for a user
   */
  async notifyUser(userId: string, payload: NotificationPayload): Promise<any> {
    try {
      const notification = new Notification({
        userId,
        message: payload.message,
        type: payload.type,
        relatedId: payload.relatedId,
        category: payload.category || "budget",
        isRead: false,
        createdAt: new Date(),
      });

      await notification.save();

      // Here you could also implement real-time notifications
      // using WebSockets, push notifications, or emails

      return notification;
    } catch (error) {
      console.error("Failed to create notification:", error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string, limit = 20): Promise<any[]> {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<any> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  }
}

export default new NotificationService();
