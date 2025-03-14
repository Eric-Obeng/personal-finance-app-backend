import express, { Router } from "express";
import {
  signup,
  login,
  getProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getAllUsers,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

export const userRoute: Router = express.Router();

userRoute.post("/signup", signup);
userRoute.post("/login", login);
userRoute.get("/profile", protect, getProfile);
userRoute.get("/verify-email/:token", verifyEmail);
userRoute.post("/forgot-password", forgotPassword);
userRoute.post("/reset-password/:token", resetPassword);
userRoute.get("/users", getAllUsers);

export default userRoute;
