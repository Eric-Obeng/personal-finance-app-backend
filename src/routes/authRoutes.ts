import express, { Router } from "express";
import { signup, login, getProfile } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

export const userRoute: Router = express.Router();

userRoute.post("/signup", signup);
userRoute.post("/login", login);
userRoute.get("/profile", protect, getProfile);

export default userRoute;
