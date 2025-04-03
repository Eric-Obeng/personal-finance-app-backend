import express, { Router } from "express";
import {
  createTransaction,
  getTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
  restoreTransaction,
  uploadTransactionAvatar,
  getTransactionOverview,
  getTransactionAnalytics,
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
transactionRouter.use(budgetLimiter);

// Upload transaction avatar
transactionRouter.post(
  "/upload-avatar",
  upload.single("avatar"),
  uploadTransactionAvatar
);

// Get transaction overview - Move before /:id routes
transactionRouter.get("/overview", getTransactionOverview);

// Get transaction analytics - Move before /:id routes
transactionRouter.get("/analytics", getTransactionAnalytics);

// Get all transactions with filtering and pagination
transactionRouter.get("/", getAllTransactions);

// Create transaction with budget validation
transactionRouter.post(
  "/",
  validateTransaction,
  validateBudgetOwnership,
  checkBudgetLimit,
  createTransaction
);

// Individual transaction routes
transactionRouter
  .route("/:id")
  .get(getTransaction)
  .put(validateTransactionUpdate, validateBudgetOwnership, updateTransaction)
  .delete(deleteTransaction);

// Restore a soft-deleted transaction
transactionRouter.patch("/:id/restore", restoreTransaction);

export default transactionRouter;
