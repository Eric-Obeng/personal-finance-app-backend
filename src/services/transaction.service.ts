import Transaction from "../models/transaction";
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
    const {
      startDate,
      endDate,
      category,
      type,
      minAmount,
      maxAmount,
      search,
      budgetId,
      potId,
      tags,
      recurring,
    } = filters;

    const { page = 1, limit = 10, sort = { date: -1 } } = paginationOptions;

    // Build query
    const query: any = { userId, isDeleted: false };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    // Category filter
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Type filter (income/expense)
    if (type) {
      query.type = type;
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = minAmount;
      if (maxAmount !== undefined) query.amount.$lte = maxAmount;
    }

    // Search filter (name or description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Budget filter
    if (budgetId) {
      query.budgetId = budgetId;
    }

    // Pot filter
    if (potId) {
      query.potId = potId;
    }

    // Tags filter
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Recurring filter
    if (recurring !== undefined) {
      query.recurring = recurring;
    }

    // Execute query
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
   * Update a transaction
   */
  async updateTransaction(
    userId: string,
    transactionId: string,
    updateData: UpdateTransactionDto
  ): Promise<TransactionResponse | null> {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId, isDeleted: false },
      { $set: updateData },
      { new: true }
    );

    return transaction ? this.transformTransaction(transaction) : null;
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
