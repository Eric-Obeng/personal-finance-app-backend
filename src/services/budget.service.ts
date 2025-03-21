import Budget from "../models/budget";
import mongoose from "mongoose";
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetFilters,
  PaginationOptions,
  PaginatedBudgetsResponse,
  BudgetResponse,
} from "../types/budget.types";
import Transaction from "../models/transaction";

interface MongoError extends Error {
  code?: number;
  keyPattern?: { [key: string]: number };
  keyValue?: { [key: string]: any };
}

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
  ): Promise<BudgetResponse> {
    try {
      const budget = new Budget({
        userId,
        ...budgetData,
      });

      await budget.save();
      return this.transformBudget(budget);
    } catch (error) {
      // Type guard for MongoError
      if (this.isMongoError(error) && error.code === 11000) {
        throw new Error(
          `Budget for category '${budgetData.category}' already exists`
        );
      }
      // Type guard for mongoose ValidationError
      if (this.isValidationError(error)) {
        const validationErrors = Object.values(error.errors)
          .map((err: any) => err.message)
          .join(", ");
        throw new Error(`Invalid budget data: ${validationErrors}`);
      }
      // Re-throw unknown errors
      throw error;
    }
  }

  /**
   * Type guard for MongoDB errors
   */
  private isMongoError(error: unknown): error is MongoError {
    return error instanceof Error && "code" in error;
  }

  /**
   * Type guard for Mongoose validation errors
   */
  private isValidationError(
    error: unknown
  ): error is mongoose.Error.ValidationError {
    return (
      error instanceof Error &&
      error.name === "ValidationError" &&
      "errors" in error
    );
  }

  /**
   * Get a budget by ID
   */
  async getBudgetById(
    userId: string,
    budgetId: string
  ): Promise<BudgetResponse | null> {
    const budget = await Budget.findOne({
      _id: budgetId,
      userId,
    });

    return budget ? this.transformBudget(budget) : null;
  }

  /**
   * Get budgets with filtering and pagination
   */
  async getBudgets(
    userId: string,
    filters: BudgetFilters = {},
    paginationOptions: PaginationOptions = {}
  ): Promise<PaginatedBudgetsResponse> {
    const {
      category,
      period,
      isActive,
      minAmount,
      maxAmount,
      search,
      startDate,
      endDate,
    } = filters;

    const {
      page = 0,
      limit = 10,
      sort = { createdAt: -1 },
    } = paginationOptions;

    // Build base query - only include isActive if explicitly set
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    // Only add isActive to query if explicitly set
    if (isActive !== undefined && isActive !== null) {
      query.isActive = isActive;
    }

    // Category filter
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Period filter
    if (period) {
      query.period = period;
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = minAmount;
      if (maxAmount !== undefined) query.amount.$lte = maxAmount;
    }

    // Date range filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = startDate;
      if (endDate) query.startDate.$lte = endDate;
    }

    // Search filter - updated to only search category
    if (search) {
      query.category = { $regex: search, $options: "i" };
    }

    // Execute query with pagination
    const skip = page * limit;
    const [budgets, total] = await Promise.all([
      Budget.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Budget.countDocuments(query),
    ]);

    return {
      budgets: budgets.map((b) => this.transformBudget(b)),
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
  async getBudgetUtilization(
    userId: string,
    budgetId: string
  ): Promise<{ budget: BudgetResponse; spent: number; remaining: number }> {
    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget) {
      throw new Error("Budget not found");
    }

    const startOfPeriod = this.calculatePeriodStartDate(
      budget.period,
      budget.startDate
    );
    const endOfPeriod = this.calculatePeriodEndDate(
      budget.period,
      budget.startDate
    );

    const spent = await Transaction.aggregate([
      {
        $match: {
          userId: budget.userId,
          budgetId: budget._id,
          type: "expense",
          date: { $gte: startOfPeriod, $lte: endOfPeriod },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalSpent = spent[0]?.total || 0;
    const remaining = Math.max(0, budget.amount - totalSpent);

    return {
      budget: this.transformBudget(budget),
      spent: totalSpent,
      remaining,
    };
  }

  /**
   * Get budgets by category
   */
  async getBudgetsByCategory(
    userId: string,
    categories: string[]
  ): Promise<BudgetResponse[]> {
    const budgets = await Budget.find({
      userId,
      category: { $in: categories },
      isActive: true,
    }).lean();

    return budgets.map((budget) => this.transformBudget(budget));
  }

  /**
   * Check if a transaction would exceed budget limit
   */
  async checkBudgetLimit(
    userId: string,
    budgetId: string,
    amount: number
  ): Promise<{
    withinLimit: boolean;
    budget: BudgetResponse;
    currentSpending: number;
    remainingBudget: number;
  }> {
    const utilization = await this.getBudgetUtilization(userId, budgetId);
    const projectedSpending = utilization.spent + amount;
    const withinLimit = projectedSpending <= utilization.budget.amount;

    return {
      withinLimit,
      budget: utilization.budget,
      currentSpending: utilization.spent,
      remainingBudget: utilization.remaining,
    };
  }

  /**
   * Get active budgets that are near their limits
   */
  async getNearLimitBudgets(
    userId: string,
    thresholdPercentage: number = 80
  ): Promise<
    Array<{
      budget: BudgetResponse;
      spent: number;
      remaining: number;
      percentageUsed: number;
    }>
  > {
    const activeBudgets = await Budget.find({
      userId,
      isActive: true,
    });

    const results = [];

    for (const budget of activeBudgets) {
      const utilization = await this.getBudgetUtilization(
        userId,
        (budget._id as string).toString()
      );
      const percentageUsed = (utilization.spent / budget.amount) * 100;

      if (percentageUsed >= thresholdPercentage) {
        results.push({
          ...utilization,
          percentageUsed,
        });
      }
    }

    return results;
  }

  /**
   * Calculate period start date based on budget period
   */
  private calculatePeriodStartDate(period: string, startDate: Date): Date {
    const date = new Date(startDate);
    date.setHours(0, 0, 0, 0);

    switch (period) {
      case "monthly":
        date.setDate(1);
        break;
      case "quarterly":
        const quarter = Math.floor(date.getMonth() / 3) * 3;
        date.setMonth(quarter, 1);
        break;
      case "yearly":
        date.setMonth(0, 1);
        break;
    }

    return date;
  }

  /**
   * Calculate period end date based on budget period
   */
  private calculatePeriodEndDate(period: string, startDate: Date): Date {
    const date = new Date(startDate);
    date.setHours(23, 59, 59, 999);

    switch (period) {
      case "monthly":
        date.setMonth(date.getMonth() + 1, 0);
        break;
      case "quarterly":
        const quarter = Math.floor(date.getMonth() / 3) * 3;
        date.setMonth(quarter + 3, 0);
        break;
      case "yearly":
        date.setMonth(11, 31);
        break;
    }

    return date;
  }
}

export default new BudgetService();
