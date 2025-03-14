import { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const generateToken = (user: Document): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// User Registration
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    user = await User.create({ name, email, password });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during user signup:", error); // Add detailed error logging
    res.status(500).json({ message: "Server error" });
  }
};

// User Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during user login:", error); // Add detailed error logging
    res.status(500).json({ message: "Server error" });
  }
};

// Get User Profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error); // Add detailed error logging
    res.status(500).json({ message: "Server error" });
  }
};
