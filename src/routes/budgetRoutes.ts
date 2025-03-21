import express, { Router } from "express";
import {
  createBudget,
  getAllBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
  getBudgetsByCategory,
  getBudgetUtilization,
} from "../controllers/budgetController";
import { protect } from "../middleware/authMiddleware";
import {
  validateBudget,
  validateBudgetUpdate,
} from "../middleware/validationMiddleware";
import { budgetLimiter } from "../middleware/budgetMiddleware";

const budgetRouter: Router = express.Router();

// All budget routes require authentication
budgetRouter.use(protect);

// Apply rate limiting to all budget routes
budgetRouter.use(budgetLimiter);

// Base routes
budgetRouter.post("/", validateBudget, createBudget);
budgetRouter.get("/", getAllBudgets);

// Category specific route
budgetRouter.get("/category/:category", getBudgetsByCategory);

// Individual budget routes
budgetRouter.get("/:id", getBudget);
budgetRouter.put("/:id", validateBudgetUpdate, updateBudget);
budgetRouter.delete("/:id", deleteBudget);

// Budget utilization route
budgetRouter.get("/:id/utilization", getBudgetUtilization);

export default budgetRouter;
