import express, { Router } from "express";
import {
  createTransaction,
  getTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
  restoreTransaction,
  uploadTransactionAvatar,
} from "../controllers/transactionController";
import { protect } from "../middleware/authMiddleware";
import {
  validateTransaction,
  validateTransactionUpdate,
} from "../middleware/validationMiddleware";
import multer from "multer";
import {
  validateBudgetOwnership,
  checkBudgetLimit,
  budgetLimiter,
} from "../middleware/budgetMiddleware";

const transactionRouter: Router = express.Router();
const upload = multer({ dest: "public/uploads/avatars/" });

// All transaction routes require authentication
transactionRouter.use(protect);

// Apply rate limiting and budget validation to transaction routes
transactionRouter.use(budgetLimiter);

// Upload transaction avatar
transactionRouter.post(
  "/upload-avatar",
  upload.single("avatar"),
  uploadTransactionAvatar
);

// Create transaction with budget validation
transactionRouter.post(
  "/",
  validateTransaction,
  validateBudgetOwnership,
  checkBudgetLimit,
  createTransaction
);

// Get all transactions with filtering and pagination
transactionRouter.get("/", getAllTransactions);

// Get, update, delete transaction by ID
transactionRouter.get("/:id", getTransaction);

// Update transaction with budget validation
transactionRouter.put(
  "/:id",
  validateTransactionUpdate,
  validateBudgetOwnership, // Middleware ensures budgetId is validated only if provided
  checkBudgetLimit,
  updateTransaction
);

transactionRouter.delete("/:id", deleteTransaction);

// Restore a soft-deleted transaction
transactionRouter.patch("/:id/restore", restoreTransaction);

export default transactionRouter;
