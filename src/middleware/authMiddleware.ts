import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error verifying token:", error); // Add detailed error logging
    res.status(401).json({ message: "Invalid token" });
  }
};
