import Budget from "../models/budget";
import mongoose from "mongoose";
import Transaction from "../models/transaction";
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetFilters,
  PaginationOptions,
  PaginatedBudgetsResponse,
  BudgetResponse,
} from "../types/budget.types";

class BudgetService {
  /**
   * Transform budget document to response object
   */
  private transformBudget(budget: any): BudgetResponse {
    const doc = budget.toObject ? budget.toObject() : budget;
    return {
      ...doc,
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
    };
  }

  /**
   * Create a new budget
   */
  async createBudget(
    userId: string,
    budgetData: CreateBudgetDto
  ): Promise<BudgetResponse | undefined> {
    try {
      const budget = new Budget({ userId, ...budgetData });
      await budget.save();
      return this.transformBudget(budget);
    } catch (error) {
      this.handleMongoError(error, budgetData.category);
      return undefined; // Ensure a return value in all code paths
    }
  }

  /**
   * Get a budget by ID
   */
  async getBudgetById(
    userId: string,
    budgetId: string
  ): Promise<BudgetResponse | null> {
    const budget = await Budget.findOne({ _id: budgetId, userId });
    return budget ? this.transformBudget(budget) : null;
  }

  /**
   * Get budget by category
   */
  async getBudgetsByCategory(
    userId: string,
    category: string
  ): Promise<BudgetResponse | null> {
    const budget = await Budget.findOne({ userId, category });
    return budget ? this.transformBudget(budget) : null;
  }

  /**
   * Get budgets with filtering and pagination
   */
  async getBudgets(
    userId: string,
    filters: BudgetFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedBudgetsResponse> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (filters.category)
      query.category = Array.isArray(filters.category)
        ? { $in: filters.category }
        : filters.category;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined)
        query.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined)
        query.amount.$lte = filters.maxAmount;
    }
    if (filters.startDate || filters.endDate) {
      query.startDate = {};
      if (filters.startDate) query.startDate.$gte = filters.startDate;
      if (filters.endDate) query.startDate.$lte = filters.endDate;
    }
    if (filters.search)
      query.category = { $regex: filters.search, $options: "i" };

    const { page = 0, limit = 10, sort = { createdAt: -1 } } = pagination;
    const skip = page * limit;

    const [budgets, total] = await Promise.all([
      Budget.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Budget.countDocuments(query),
    ]);

    return {
      budgets: budgets.map(this.transformBudget),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update a budget
   */
  async updateBudget(
    userId: string,
    budgetId: string,
    updateData: UpdateBudgetDto
  ): Promise<BudgetResponse | null> {
    const budget = await Budget.findOneAndUpdate(
      { _id: budgetId, userId },
      { $set: updateData },
      { new: true }
    );
    return budget ? this.transformBudget(budget) : null;
  }

  /**
   * Delete a budget
   */
  async deleteBudget(userId: string, budgetId: string): Promise<boolean> {
    const result = await Budget.deleteOne({ _id: budgetId, userId });
    return result.deletedCount > 0;
  }

  /**
   * Get budget utilization
   */
  async getBudgetUtilization(userId: string, budgetId: string) {
    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget) throw new Error("Budget not found");

    const transactions = await Transaction.aggregate([
      {
        $match: {
          userId: budget.userId,
          budgetId: budget._id,
          type: "expense",
          isDeleted: false,
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const spent = transactions[0]?.total || 0;
    const remaining = Math.max(0, budget.amount - spent);

    return { budget: this.transformBudget(budget), spent, remaining };
  }

  /**
   * Check if a transaction would exceed the budget
   */
  async checkBudgetLimit(userId: string, budgetId: string, amount: number) {
    const { budget, spent } = await this.getBudgetUtilization(userId, budgetId);
    const withinLimit = spent + amount <= budget.amount;

    return {
      withinLimit,
      budget,
      currentSpending: spent,
      remainingBudget: budget.amount - spent,
    };
  }

  /**
   * Get active budgets that are near their limits
   */
  async getNearLimitBudgets(userId: string, threshold = 80) {
    const budgets = await Budget.find({ userId, isActive: true });
    const results = await Promise.all(
      budgets.map(async (budget) => {
        const { spent } = await this.getBudgetUtilization(
          userId,
          (budget._id as mongoose.Types.ObjectId).toString()
        );
        const percentageUsed = (spent / budget.amount) * 100;
        return percentageUsed >= threshold
          ? { budget: this.transformBudget(budget), spent, percentageUsed }
          : null;
      })
    );

    return results.filter(Boolean);
  }

  /**
   * Error Handling - MongoDB Validation & Duplicate Errors
   */
  private handleMongoError(error: unknown, category?: string) {
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      throw new Error(`Invalid data: ${messages}`);
    }
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      throw new Error(`Budget for category '${category}' already exists`);
    }
    throw error;
  }
}

export default new BudgetService();
