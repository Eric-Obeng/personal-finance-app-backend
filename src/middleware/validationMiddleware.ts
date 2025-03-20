import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import {
  TransactionType,
  RecurringFrequency,
} from "../types/transaction.types";

// Transaction validation schema
const transactionSchema = Joi.object({
  name: Joi.string().required().trim().max(100),
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
      .map((detail) => detail.message)
      .join(", ");
    res.status(400).json({ message: "Validation error", errors: errorMessage });
    return;
  }

  next();
};

// Validation schema for transaction update
const updateTransactionSchema = Joi.object({
  name: Joi.string().optional().trim().max(100),
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
      .map((detail) => detail.message)
      .join(", ");
    res.status(400).json({ message: "Validation error", errors: errorMessage });
    return;
  }

  next();
};
