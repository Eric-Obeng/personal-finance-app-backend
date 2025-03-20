export type TransactionType = 'income' | 'expense';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CreateTransactionDto {
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  date?: Date;
  recurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  avatar?: string;
  budgetId?: string;
  potId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateTransactionDto {
  name?: string;
  amount?: number;
  type?: TransactionType;
  category?: string;
  description?: string;
  date?: Date;
  recurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  avatar?: string;
  budgetId?: string;
  potId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string | string[];
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  budgetId?: string;
  potId?: string;
  tags?: string[];
  recurring?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export interface TransactionResponse {
  _id: string;
  userId: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  date: Date;
  recurring: boolean;
  recurringFrequency?: RecurringFrequency;
  avatar?: string;
  budgetId?: string;
  potId?: string;
  parentTransactionId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedTransactionsResponse {
  transactions: TransactionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 