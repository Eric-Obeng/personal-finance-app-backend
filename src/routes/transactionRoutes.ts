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

const transactionRouter: Router = express.Router();
const upload = multer({ dest: "public/uploads/avatars/" });

// All transaction routes require authentication
transactionRouter.use(protect);

// Upload transaction avatar
transactionRouter.post(
  "/upload-avatar",
  upload.single("avatar"),
  uploadTransactionAvatar
);

// Create transaction
transactionRouter.post("/", validateTransaction, createTransaction);

// Get all transactions with filtering and pagination
transactionRouter.get("/", getAllTransactions);

// Get, update, delete transaction by ID
transactionRouter.get("/:id", getTransaction);
transactionRouter.put("/:id", validateTransactionUpdate, updateTransaction);
transactionRouter.delete("/:id", deleteTransaction);

// Restore a soft-deleted transaction
transactionRouter.patch("/:id/restore", restoreTransaction);

export default transactionRouter;
