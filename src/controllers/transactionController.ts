import { Request, Response } from "express";
import transactionService from "../services/transaction.service";
import budgetService from "../services/budget.service";
import notificationService from "../services/notification.service";
import categoryService from "../services/category.service";
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  PaginationOptions,
} from "../types/transaction.types";
import createError from "http-errors";
import multer from "multer";
import path from "path";
import fs from "fs";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/uploads/avatars";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
    }
  },
});

// Upload transaction avatar
export const uploadTransactionAvatar = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    res.status(200).json({ avatarUrl });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
};

// Create a new transaction
export const createTransaction = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if category exists, if not create it
    const { category, ...transactionData } = req.body;
    const categories = await categoryService.getCategoryNames();

    if (!categories.includes(category)) {
      try {
        await categoryService.createCategory({
          name: category,
          theme: "#000000", // Default theme
          description: `Category created from transaction by user ${userId}`,
        });
      } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY" || error.code === 11000) {
          console.warn(`Category "${category}" already exists. Skipping creation.`);
        } else {
          throw error;
        }
      }
    }

    const transaction = await transactionService.createTransaction(userId, {
      category,
      ...transactionData,
    });

    // Notify if budget is near limit
    if (transaction.budgetId && transaction.type === "expense") {
      const utilization = await budgetService.getBudgetUtilization(
        userId,
        transaction.budgetId
      );
      const percentageUsed =
        (utilization.spent / utilization.budget.amount) * 100;

      if (percentageUsed >= 80) {
        // Notify the user about high budget utilization
        await notificationService.notifyUser(userId, {
          message: `Budget ${utilization.budget.category} is at ${percentageUsed.toFixed(1)}% utilization`,
          type: "warning",
          relatedId: transaction.budgetId,
          category: "budget",
        });
      }
    }

    res.status(201).json({ transaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Failed to create transaction" });
  }
};

// Get a single transaction by ID
export const getTransaction = async (
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
    const transaction = await transactionService.getTransactionById(userId, id);

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json({ transaction });
  } catch (error) {
    console.error("Error getting transaction:", error);
    res.status(500).json({ message: "Failed to get transaction" });
  }
};

// Get all transactions with filtering and pagination
export const getAllTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Parse query parameters for filtering
    const filters: TransactionFilters = {};
    const paginationOptions: PaginationOptions = {};

    // Date filters
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    // Category filter
    if (req.query.category) {
      filters.category = req.query.category as string;
    }

    // Type filter
    if (req.query.type) {
      filters.type = req.query.type as "income" | "expense";
    }

    // Amount filters
    if (req.query.minAmount) {
      filters.minAmount = parseFloat(req.query.minAmount as string);
    }
    if (req.query.maxAmount) {
      filters.maxAmount = parseFloat(req.query.maxAmount as string);
    }

    // Search filter
    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    // Budget and pot filters
    if (req.query.budgetId) {
      filters.budgetId = req.query.budgetId as string;
    }
    if (req.query.potId) {
      filters.potId = req.query.potId as string;
    }

    // Tags filter
    if (req.query.tags) {
      filters.tags = (req.query.tags as string).split(",");
    }

    // Recurring filter
    if (req.query.recurring !== undefined) {
      filters.recurring = req.query.recurring === "true";
    }

    // Pagination starting from 1
    if (req.query.page !== undefined) {
      paginationOptions.page = Math.max(1, parseInt(req.query.page as string));
    }
    if (req.query.limit) {
      paginationOptions.limit = parseInt(req.query.limit as string);
    }

    // Calculate skip value for pagination
    if (paginationOptions.page && paginationOptions.limit) {
      paginationOptions.skip =
        (paginationOptions.page - 1) * paginationOptions.limit;
    }

    // Sorting
    if (req.query.sortBy && req.query.sortOrder) {
      const sortField = req.query.sortBy as string;
      const sortOrder = parseInt(req.query.sortOrder as string) as 1 | -1;
      paginationOptions.sort = { [sortField]: sortOrder };
    }

    const transactions = await transactionService.getTransactions(
      userId,
      filters,
      paginationOptions
    );

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error getting transactions:", error);
    res.status(500).json({ message: "Failed to get transactions" });
  }
};

// Update a transaction
export const updateTransaction = async (
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
    const updateData: UpdateTransactionDto = req.body;

    const transaction = await transactionService.updateTransaction(
      userId,
      id,
      updateData
    );

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json({ transaction });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Failed to update transaction" });
  }
};

// Delete a transaction (soft delete)
export const deleteTransaction = async (
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
    const success = await transactionService.deleteTransaction(userId, id);

    if (!success) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};

// Restore a deleted transaction
export const restoreTransaction = async (
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
    const transaction = await transactionService.restoreTransaction(userId, id);

    if (!transaction) {
      res
        .status(404)
        .json({ message: "Transaction not found or already restored" });
      return;
    }

    res.status(200).json({ transaction });
  } catch (error) {
    console.error("Error restoring transaction:", error);
    res.status(500).json({ message: "Failed to restore transaction" });
  }
};

// Get transaction overview
export const getTransactionOverview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 5;
    const sort: Record<string, 1 | -1> =
      req.query.sort === "latest" ? { updatedAt: -1 } : { updatedAt: 1 };

    // Fetch the last few transactions
    const transactions = await transactionService.getTransactions(
      userId,
      {},
      { limit, sort }
    );

    // Map the transactions to include only the required fields
    const transactionOverview = transactions.transactions.map(
      (transaction) => ({
        name: transaction.name,
        date: transaction.date,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        updatedAt: transaction.updatedAt,
      })
    );

    res.status(200).json(transactionOverview);
  } catch (error) {
    console.error("Error fetching transaction overview:", error);
    res.status(500).json({ message: "Failed to fetch transaction overview" });
  }
};

// Get transaction analytics
export const getTransactionAnalytics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const dateRange = req.query.dateRange || "last30days";
    const now = new Date();
    let startDate: Date;

    // Determine the start date based on the date range
    if (dateRange === "last30days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "last7days") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "thisMonth") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      res.status(400).json({ message: "Invalid date range" });
      return;
    }

    // Fetch transactions within the date range
    const transactions = await transactionService.getTransactions(userId, {
      startDate,
      endDate: now,
    });

    // Calculate transaction trends over time
    const transactionTrends: { date: string; amount: number }[] = [];
    const trendMap: Record<string, number> = {};

    transactions.transactions.forEach((transaction) => {
      const date = transaction.date.toISOString().split("T")[0];
      trendMap[date] = (trendMap[date] || 0) + transaction.amount;
    });

    for (const [date, amount] of Object.entries(trendMap)) {
      transactionTrends.push({ date, amount });
    }

    // Calculate category breakdown
    const categoryMap: Record<string, number> = {};
    let totalAmount = 0;

    transactions.transactions.forEach((transaction) => {
      categoryMap[transaction.category] =
        (categoryMap[transaction.category] || 0) + transaction.amount;
      totalAmount += transaction.amount;
    });

    const categoryBreakdown = Object.entries(categoryMap).map(
      ([category, amount]) => ({
        category,
        percentage: Math.round((amount / totalAmount) * 100),
      })
    );

    res.status(200).json({
      transactionTrends,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Error fetching transaction analytics:", error);
    res.status(500).json({ message: "Failed to fetch transaction analytics" });
  }
};
