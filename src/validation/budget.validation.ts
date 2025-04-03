import Joi from "joi";
import categoryService from "../services/category.service";

export const createBudgetValidation = async () => {
  const categories = await categoryService.getCategoryNames();

  return {
    create: Joi.object({
      category: Joi.string()
        .valid(...categories)
        .required(),
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
    }),

    update: Joi.object({
      category: Joi.string().valid(...categories),
      amount: Joi.number().min(0),
      theme: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
      period: Joi.string().valid("monthly", "quarterly", "yearly"),
      startDate: Joi.date(),
      isActive: Joi.boolean(),
      metadata: Joi.object(),
    }).min(1),
  };
};
