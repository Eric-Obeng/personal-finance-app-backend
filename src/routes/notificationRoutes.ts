import express, { Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";
import notificationService from "../services/notification.service";

// Define interface to extend Request with user property
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const router = express.Router();

// Get all notifications for the authenticated user
router.get("/", protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const notifications = await notificationService.getUserNotifications(
      userId,
      limit
    );

    res.status(200).json({
      status: "success",
      data: { notifications },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch notifications",
    });
  }
});

// Mark a notification as read
router.patch(
  "/:id/read",
  protect,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      const { id } = req.params;

      const notification = await notificationService.markAsRead(userId, id);

      if (!notification) {
        res.status(404).json({
          status: "error",
          message: "Notification not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: { notification },
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to mark notification as read",
      });
    }
  }
);

// Mark all notifications as read
router.patch(
  "/read-all",
  protect,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          status: "error",
          message: "Unauthorized",
        });
        return;
      }

      await notificationService.markAllAsRead(userId);

      res.status(200).json({
        status: "success",
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to mark all notifications as read",
      });
    }
  }
);

export default router;
