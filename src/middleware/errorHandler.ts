import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

export const errorHandler = (
  err: createError.HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error handler:", err); // Add detailed error logging
  const statusCode = err.status || 500;
  res.status(statusCode);
  res.json({
    status: statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack, 
  });
};
