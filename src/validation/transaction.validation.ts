import Joi from "joi";

export const transactionValidation = {
  create: Joi.object({
    // ...existing code...
    name: Joi.string().required(),
    // ...existing code...
  }),

  update: Joi.object({
    // ...existing code...
    name: Joi.string(),
    // ...existing code...
  }),
};
