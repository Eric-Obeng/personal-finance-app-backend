import Transaction from "../models/transaction";
import mongoose from "mongoose";
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  PaginationOptions,
  PaginatedTransactionsResponse,
  TransactionResponse,
} from "../types/transaction.types";
import { ITransaction } from "../models/transaction";

class TransactionService {
  /**
   * Transform transaction document to response object
   */
  private transformTransaction(transaction: any): TransactionResponse {
    const doc = transaction.toObject ? transaction.toObject() : transaction;
    return {
      ...doc,
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      budgetId: doc.budgetId ? doc.budgetId.toString() : undefined,
      potId: doc.potId ? doc.potId.toString() : undefined,
      parentTransactionId: doc.parentTransactionId
        ? doc.parentTransactionId.toString()
        : undefined,
    };
  }

  /**
   * Create a new transaction
   */
  async createTransaction(
    userId: string,
    transactionData: CreateTransactionDto
  ): Promise<TransactionResponse> {
    const transaction = new Transaction({
      userId,
      ...transactionData,
    });

    await transaction.save();
    return this.transformTransaction(transaction);
  }

  /**
   * Get a transaction by ID
   */
  async getTransactionById(
    userId: string,
    transactionId: string
  ): Promise<TransactionResponse | null> {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
      isDeleted: false,
    });

    return transaction ? this.transformTransaction(transaction) : null;
  }

  /**
   * Get all transactions with pagination and filtering
   */
  async getTransactions(
    userId: string,
    filters: TransactionFilters = {},
    paginationOptions: PaginationOptions = {}
  ): Promise<PaginatedTransactionsResponse> {
    const { startDate, endDate, ...otherFilters } = filters;

    const query: any = { userId, isDeleted: false };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // Apply other filters
    Object.assign(query, otherFilters);

    const { page = 1, limit = 10, sort = { date: -1 } } = paginationOptions;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(query),
    ]);

    return {
      transactions: transactions.map((t) => this.transformTransaction(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all transactions for a user
   */
  async getAllTransactions(userId: string): Promise<ITransaction[]> {
    return Transaction.find({ userId, isDeleted: false }).lean();
  }

  /**
   * Get all recurring transactions for a user
   */
  async getRecurringTransactions(userId: string): Promise<ITransaction[]> {
    return Transaction.find({
      userId,
      recurring: true,
      isDeleted: false,
    }).lean();
  }

  /**
   * Update a transaction
   */
  async updateTransaction(
    userId: string,
    transactionId: string,
    updateData: UpdateTransactionDto
  ): Promise<TransactionResponse | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        console.log(`Invalid transaction ID format: ${transactionId}`);
        return null;
      }

      const transaction = await Transaction.findOneAndUpdate(
        {
          _id: transactionId,
          userId,
          isDeleted: false,
        },
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!transaction) {
        console.log(
          `Transaction not found - userId: ${userId}, transactionId: ${transactionId}`
        );
        return null;
      }

      return this.transformTransaction(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }

  /**
   * Soft delete a transaction
   */
  async deleteTransaction(
    userId: string,
    transactionId: string
  ): Promise<boolean> {
    const result = await Transaction.updateOne(
      { _id: transactionId, userId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Hard delete a transaction (admin only)
   */
  async hardDeleteTransaction(transactionId: string): Promise<boolean> {
    const result = await Transaction.deleteOne({ _id: transactionId });
    return result.deletedCount > 0;
  }

  /**
   * Restore a soft-deleted transaction
   */
  async restoreTransaction(
    userId: string,
    transactionId: string
  ): Promise<TransactionResponse | null> {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId, isDeleted: true },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
        },
      },
      { new: true }
    );

    return transaction ? this.transformTransaction(transaction) : null;
  }

  /**
   * Create a recurring instance of a transaction
   */
  async createRecurringInstance(
    transactionId: string,
    newDate: Date
  ): Promise<TransactionResponse | null> {
    const sourceTransaction = await Transaction.findOne({
      _id: transactionId,
      recurring: true,
      isDeleted: false,
    });

    if (!sourceTransaction) return null;

    const { _id, createdAt, updatedAt, ...transactionData } =
      sourceTransaction.toObject();

    const newTransaction = new Transaction({
      ...transactionData,
      date: newDate,
      parentTransactionId: sourceTransaction._id,
    });

    await newTransaction.save();
    return this.transformTransaction(newTransaction);
  }
}

export default new TransactionService();
