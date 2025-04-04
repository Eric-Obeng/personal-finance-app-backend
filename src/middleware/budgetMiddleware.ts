import { Request, Response, NextFunction } from "express";
import budgetService from "../services/budget.service";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// Rate limiting middleware
export const budgetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

// Validate budget exists and user owns it
export const validateBudgetOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const budgetId = req.body.budgetId;

    // Skip validation if no budgetId is provided in the request
    if (!budgetId) {
      return next();
    }

    // Validate if budgetId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      res.status(400).json({ message: "Invalid budget ID format" });
      return;
    }

    const budget = await budgetService.getBudgetById(userId!, budgetId);
    if (!budget) {
      console.log(
        `Budget not found - userId: ${userId}, budgetId: ${budgetId}`
      );
      res.status(404).json({ message: "Budget not found or unauthorized" });
      return;
    }

    next();
  } catch (error) {
    console.error("Error validating budget ownership:", error);
    res.status(500).json({
      message: "Error validating budget ownership",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Check budget limit with improved validation
export const checkBudgetLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { budgetId, amount, type } = req.body;

    if (!budgetId || type !== "expense") {
      return next();
    }

    // Validate if budgetId is a valid MongoDB ObjectId
    if (budgetId && !mongoose.Types.ObjectId.isValid(budgetId)) {
      res.status(400).json({ message: "Invalid budget ID format" });
      return;
    }

    const limitCheck = await budgetService.checkBudgetLimit(
      userId!,
      budgetId,
      amount
    );

    if (!limitCheck.withinLimit) {
      res.status(400).json({
        message: "Transaction would exceed budget limit",
        budget: limitCheck.budget,
        currentSpending: limitCheck.currentSpending,
        remainingBudget: limitCheck.remainingBudget,
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error checking budget limit:", error);
    res.status(500).json({
      message: "Error checking budget limit",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
