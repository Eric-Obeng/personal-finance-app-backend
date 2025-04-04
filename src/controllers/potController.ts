import { Request, Response } from "express";
import potService from "../services/pot.service";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const createPot = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const pot = await potService.createPot(userId, req.body);
    res.status(201).json({
      success: true,
      message: "Pot created successfully",
      data: pot,
    });
  } catch (error: any) {
    console.error("Error creating pot:", error);

    // Handle validation errors
    if (error.message.includes("Invalid pot data:")) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: {
          details: error.message.split("Invalid pot data:")[1].trim(),
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create pot",
      error: error.message,
    });
  }
};

export const getPots = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Pass only the userId to the getPots method
    const pots = await potService.getPots(userId);
    res.status(200).json({ pots });
  } catch (error) {
    console.error("Error getting pots:", error);
    res.status(500).json({ message: "Failed to get pots" });
  }
};

export const getPot = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const pot = await potService.getPotById(userId, req.params.id);
    if (!pot) {
      res.status(404).json({ message: "Pot not found" });
      return;
    }

    res.status(200).json({ pot });
  } catch (error) {
    console.error("Error getting pot:", error);
    res.status(500).json({ message: "Failed to get pot" });
  }
};

export const updatePot = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const pot = await potService.updatePot(userId, req.params.id, req.body);
    if (!pot) {
      res.status(404).json({ message: "Pot not found" });
      return;
    }

    res.status(200).json({ pot });
  } catch (error) {
    console.error("Error updating pot:", error);
    res.status(500).json({ message: "Failed to update pot" });
  }
};

export const deletePot = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const success = await potService.deletePot(userId, req.params.id);
    if (!success) {
      res.status(404).json({ message: "Pot not found" });
      return;
    }

    res.status(200).json({ message: "Pot deleted successfully" });
  } catch (error) {
    console.error("Error deleting pot:", error);
    res.status(500).json({ message: "Failed to delete pot" });
  }
};

export const updatePotBalance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { amount, operation } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
      return;
    }

    if (!["add", "withdraw"].includes(operation)) {
      res.status(400).json({
        success: false,
        message: "Operation must be either 'add' or 'withdraw'",
      });
      return;
    }

    // Convert amount based on operation
    const adjustedAmount = operation === "withdraw" ? -amount : amount;

    const pot = await potService.updatePotBalance(
      userId,
      req.params.id,
      adjustedAmount
    );
    if (!pot) {
      res.status(404).json({
        success: false,
        message: "Pot not found",
      });
      return;
    }

    const operationPastTense = operation === "add" ? "added" : "withdrew";
    res.status(200).json({
      success: true,
      message: `Successfully ${operationPastTense} ${amount} from pot`,
      data: pot,
    });
  } catch (error: any) {
    console.error("Error updating pot balance:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update pot balance",
    });
  }
};
