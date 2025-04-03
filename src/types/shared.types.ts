export const TRANSACTION_CATEGORIES = [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Shopping",
  "Education",
  "Travel",
  "Other",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export interface CategoryValidationError {
  message: string;
  code: string;
}
