import { Request, Response } from "express";
import budgetService from "../services/budget.service";
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetRequestFilters,
} from "../types/budget.types";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// Create a new budget
export const createBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }

    // Validate required fields
    const { category, amount } = req.body;
    if (!category) {
      res.status(400).json({
        success: false,
        message: "Category is required",
      });
      return;
    }
    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
      return;
    }

    const budgetData: CreateBudgetDto = req.body;
    const budget = await budgetService.createBudget(userId, budgetData);

    res.status(201).json({
      success: true,
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    console.error("Error creating budget:", error);

    // Handle specific error types
    if (error instanceof Error && error.message.includes("already exists")) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof Error && error.message.includes("Invalid budget data")) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unable to create budget. Please try again later.",
      error: error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

// Get all budgets with filtering and pagination
export const getAllBudgets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const filters: BudgetRequestFilters = {
      category: req.query.category as string | string[],
      period: req.query.period as "monthly" | "quarterly" | "yearly",
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
      search: req.query.search as string,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
    };

    // Remove undefined values from filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const paginationOptions = {
      page: Math.max(0, Number(req.query.page) || 0),
      limit: Number(req.query.limit) || 10,
      sort: req.query.sort ? JSON.parse(req.query.sort as string) : undefined,
    };

    const budgets = await budgetService.getBudgets(
      userId,
      filters,
      paginationOptions
    );

    res.status(200).json(budgets);
  } catch (error) {
    console.error("Error getting budgets:", error);
    res.status(500).json({ message: "Failed to get budgets" });
  }
};

// Get a single budget by ID
export const getBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const budget = await budgetService.getBudgetById(userId, id);

    if (!budget) {
      res.status(404).json({ message: "Budget not found" });
      return;
    }

    res.status(200).json({ budget });
  } catch (error) {
    console.error("Error getting budget:", error);
    res.status(500).json({ message: "Failed to get budget" });
  }
};

// Update a budget
export const updateBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const updateData: UpdateBudgetDto = req.body;

    const budget = await budgetService.updateBudget(userId, id, updateData);

    if (!budget) {
      res.status(404).json({ message: "Budget not found" });
      return;
    }

    res.status(200).json({ budget });
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ message: "Failed to update budget" });
  }
};

// Delete a budget
export const deleteBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const success = await budgetService.deleteBudget(userId, id);

    if (!success) {
      res.status(404).json({ message: "Budget not found" });
      return;
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ message: "Failed to delete budget" });
  }
};

// Get budgets by category
export const getBudgetsByCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { category } = req.params;
    const categories = category.split(",");
    const budgets = await budgetService.getBudgetsByCategory(
      userId,
      categories.join(",")
    );

    res.status(200).json({ budgets });
  } catch (error) {
    console.error("Error getting budgets by category:", error);
    res.status(500).json({ message: "Failed to get budgets by category" });
  }
};

// Get budget utilization
export const getBudgetUtilization = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const utilization = await budgetService.getBudgetUtilization(userId, id);

    res.status(200).json(utilization);
  } catch (error) {
    console.error("Error getting budget utilization:", error);
    res.status(500).json({ message: "Failed to get budget utilization" });
  }
};
