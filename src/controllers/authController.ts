import { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import crypto from "crypto";
import { sendEmail } from "../utils/email";

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

    user = new User({ name, email, password });
    const verificationToken = user.getVerificationToken();
    await user.save();

    const verificationUrl = `${process.env.HOSTED_BACKEND}/api/v1/auth/verify-email/${verificationToken}`;

    const message = `Please verify your email by clicking on the following link: \n\n ${verificationUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      message,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error during user signup:", error); // Add detailed error logging
    res.status(500).json({ message: "Server error" });
  }
};

// Verify Email
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();

    res.send(`
      <h1>Email Verified Successfully</h1>
      <p>Your email has been verified successfully. You can now <a href="https://your-frontend-url.com/login">login</a>.</p>
    `);
  } catch (error) {
    console.error("Error during email verification:", error); // Add detailed error logging
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

    if (!user.isEmailVerified) {
      res.status(400).json({ message: "Please verify your email to login" });
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

// Forgot Password
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `${process.env.HOSTED_BACKEND}/api/v1/auth/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link to reset your password: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error during password reset request:", error); // Add detailed error logging
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error during password reset:", error); // Add detailed error logging
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error); // Add detailed error logging
    res.status(500).json({ message: "Server error" });
  }
};
