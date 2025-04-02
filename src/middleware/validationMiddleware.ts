import { Request, Response, NextFunction } from "express";
import Joi, { ValidationError } from "joi";
import {
  TransactionType,
  RecurringFrequency,
} from "../types/transaction.types";

// Transaction validation schema
const transactionSchema = Joi.object({
  name: Joi.string().required().trim().max(100), // Ensure name is required and has a max length
  amount: Joi.number().required().min(0),
  type: Joi.string().valid("income", "expense").required(),
  category: Joi.string().required().trim().max(50),
  description: Joi.string().optional().allow("").max(500),
  date: Joi.date().optional().default(Date.now),
  recurring: Joi.boolean().optional().default(false),
  recurringFrequency: Joi.string()
    .valid("daily", "weekly", "monthly", "yearly")
    .optional()
    .default("monthly"),
  avatar: Joi.string()
    .optional()
    .allow("")
    .pattern(/^\/uploads\/avatars\/.*$/),
  budgetId: Joi.string().optional().allow(""),
  potId: Joi.string().optional().allow(""),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  metadata: Joi.object().optional(),
});

// Validation middleware for transactions
export const validateTransaction = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = transactionSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail: Joi.ValidationErrorItem) => detail.message)
      .join(", ");
    res.status(400).json({ message: "Validation error", errors: errorMessage });
    return;
  }

  next();
};

// Validation schema for transaction update
const updateTransactionSchema = Joi.object({
  amount: Joi.number().optional().min(0),
  type: Joi.string().valid("income", "expense").optional(),
  category: Joi.string().optional().trim().max(50),
  description: Joi.string().optional().allow("").max(500),
  date: Joi.date().optional(),
  recurring: Joi.boolean().optional(),
  recurringFrequency: Joi.string()
    .valid("daily", "weekly", "monthly", "yearly")
    .optional(),
  avatar: Joi.string()
    .optional()
    .allow("")
    .pattern(/^\/uploads\/avatars\/.*$/),
  budgetId: Joi.string().optional().allow(""),
  potId: Joi.string().optional().allow(""),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  metadata: Joi.object().optional(),
}).min(1); // At least one field must be provided for update

// Validation middleware for transaction updates
export const validateTransactionUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = updateTransactionSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail: Joi.ValidationErrorItem) => detail.message)
      .join(", ");
    res.status(400).json({ message: "Validation error", errors: errorMessage });
    return;
  }

  next();
};

// Budget validation schema
const budgetSchema = Joi.object({
  category: Joi.string().required().trim().max(50),
  amount: Joi.number().required().min(0),
  theme: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .default("#000000"),
  period: Joi.string()
    .valid("monthly", "quarterly", "yearly")
    .default("monthly"),
  startDate: Joi.date().default(Date.now),
  isActive: Joi.boolean().default(true),
  metadata: Joi.object().optional(),
});

// Budget update validation schema
const updateBudgetSchema = Joi.object({
  category: Joi.string().trim().max(50),
  amount: Joi.number().min(0),
  theme: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  period: Joi.string().valid("monthly", "quarterly", "yearly"),
  startDate: Joi.date(),
  isActive: Joi.boolean(),
  metadata: Joi.object(),
}).min(1); // At least one field must be provided for update

// Validation middleware for budgets
export const validateBudget = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = budgetSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      .map((detail: Joi.ValidationErrorItem) => detail.message)
      .join(", ");
    res.status(400).json({ message: "Validation error", errors: errorMessage });
    return;
  }

  next();
};

// Validation middleware for budget updates
export const validateBudgetUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = updateBudgetSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errorMessage = error.details
      .map((detail: Joi.ValidationErrorItem) => detail.message)
      .join(", ");
    res.status(400).json({ message: "Validation error", errors: errorMessage });
    return;
  }

  next();
};

// Pot validation schema
const potSchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  currentAmount: Joi.number().required().min(0),
  goalAmount: Joi.number().required().min(0),
  targetDate: Joi.date().required().greater("now"),
  theme: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .required()
    .messages({
      "string.pattern.base": "Theme must be a valid hex color code",
    }),
  description: Joi.string().optional().allow("").max(500),
  category: Joi.string().optional().trim().max(50),
  metadata: Joi.object().optional(),
});

const updatePotSchema = Joi.object({
  name: Joi.string().trim().max(100),
  goalAmount: Joi.number().min(0),
  targetDate: Joi.date().greater("now"),
  description: Joi.string().allow("").max(500),
  category: Joi.string().trim().max(50),
  metadata: Joi.object(),
}).min(1); // At least one field must be provided for update

// Validation middleware for pots
export const validatePot = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = potSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }
  next();
};

// Validation middleware for pot updates
export const validatePotUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = updatePotSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }
  next();
};

// Pot balance validation schema
const potBalanceSchema = Joi.object({
  amount: Joi.number().required().greater(0).messages({
    "number.greater": "Amount must be greater than 0",
  }),
  operation: Joi.string().required().valid("add", "withdraw").messages({
    "any.only": 'Operation must be either "add" or "withdraw"',
  }),
});

// Validation middleware for pot balance operations
export const validatePotBalance = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = potBalanceSchema.validate(req.body, { abortEarly: false });
  if (error) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
    return;
  }
  next();
};
