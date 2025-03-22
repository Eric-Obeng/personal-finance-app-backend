import { Request, Response, NextFunction } from "express";
import budgetService from "../services/budget.service";
import rateLimit from "express-rate-limit";

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
    const budgetId = req.body.budgetId || req.params.id;

    if (!budgetId) {
      next();
      return;
    }

    const budget = await budgetService.getBudgetById(userId!, budgetId);
    if (!budget) {
      res.status(404).json({ message: "Budget not found or unauthorized" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Error validating budget ownership" });
  }
};

// Check budget limit before transaction creation/update
export const checkBudgetLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { budgetId, amount, type } = req.body;

    if (!budgetId || type !== "expense") {
      next();
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
    res.status(500).json({ message: "Error checking budget limit" });
  }
};
