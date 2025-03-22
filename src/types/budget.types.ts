export type BudgetPeriod = "monthly" | "quarterly" | "yearly";

export interface CreateBudgetDto {
  category: string;
  amount: number;
  theme?: string;
  period?: BudgetPeriod;
  startDate?: Date;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateBudgetDto {
  category?: string;
  amount?: number;
  theme?: string;
  period?: BudgetPeriod;
  startDate?: Date;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface BudgetFilters {
  category?: string | string[];
  period?: BudgetPeriod;
  isActive?: boolean;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface BudgetRequestFilters {
  [key: string]: any;
  category?: string | string[];
  period?: "monthly" | "quarterly" | "yearly";
  isActive?: boolean;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface BudgetResponse {
  _id: string;
  userId: string;
  category: string;
  amount: number;
  theme: string;
  period: BudgetPeriod;
  startDate: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedBudgetsResponse {
  budgets: BudgetResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}
