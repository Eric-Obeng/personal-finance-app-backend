import Joi from "joi";

export const transactionValidation = {
  create: Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required().trim(), // Allow any string
  }),

  update: Joi.object({
    name: Joi.string(),
    category: Joi.string().trim(), // Allow any string
  }),
};
