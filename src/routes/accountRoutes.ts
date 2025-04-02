import express, { Router } from "express";
import {
  getAccountSummary,
  getSavingsPotsOverview,
  getBudgetOverview,
} from "../controllers/accountController";
import { protect } from "../middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const accountRouter: Router = express.Router();

// Rate limiting middleware for account routes
const accountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

// All account routes require authentication
accountRouter.use(protect);

// Get account summary with rate limiting
accountRouter.get("/account-summary", accountLimiter, getAccountSummary);

// Get savings pots overview with rate limiting
accountRouter.get("/savings-pots", accountLimiter, getSavingsPotsOverview);

// Get budget overview with rate limiting
accountRouter.get("/budgets", accountLimiter, getBudgetOverview);

export default accountRouter;
