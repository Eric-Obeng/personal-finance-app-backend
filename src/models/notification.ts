import mongoose from "mongoose";
import { NotificationType } from "../services/notification.service";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["info", "success", "warning", "error"],
    default: "info",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    default: "general",
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for faster queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
