import express, { Router } from "express";
import { getRecurringBillsSummary } from "../controllers/recurringBillController";
import { protect } from "../middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const recurringBillRouter: Router = express.Router();

// Rate limiting middleware for recurring bills routes
const recurringBillLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

// All recurring bills routes require authentication
recurringBillRouter.use(protect);

// Get recurring bills summary with rate limiting
recurringBillRouter.get(
  "/summary",
  recurringBillLimiter,
  getRecurringBillsSummary
);

export default recurringBillRouter;
