import { Request, Response } from "express";
import transactionService from "../services/transaction.service";
import potService from "../services/pot.service";
import budgetService from "../services/budget.service";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const getAccountSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Fetch all transactions for the user
    const transactions = await transactionService.getAllTransactions(userId);

    // Calculate income, expenses, and current balance
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = income - expenses;

    res.status(200).json({
      currentBalance,
      income,
      expenses,
    });
  } catch (error) {
    console.error("Error fetching account summary:", error);
    res.status(500).json({ message: "Failed to fetch account summary" });
  }
};

export const getSavingsPotsOverview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Fetch all pots for the user
    const pots = await potService.getPots(userId);

    // Calculate total saved amount
    const totalSaved = pots.reduce((sum, pot) => sum + pot.currentAmount, 0);

    // Limit to 5 pots and prepare breakdown
    const breakdown = pots.slice(0, 5).map((pot) => ({
      name: pot.name,
      category: pot.category || "Uncategorized",
      currentAmount: pot.currentAmount,
      goalAmount: pot.goalAmount,
      progress: pot.progress,
    }));

    res.status(200).json({
      totalSaved,
      breakdown,
    });
  } catch (error) {
    console.error("Error fetching savings pots overview:", error);
    res.status(500).json({ message: "Failed to fetch savings pots overview" });
  }
};

export const getBudgetOverview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Fetch all budgets for the user
    const budgetsResponse = await budgetService.getBudgets(userId);

    // Calculate total budget and amount spent
    const totalBudget = budgetsResponse.budgets.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );
    const amountSpent = budgetsResponse.budgets.reduce(
      (sum, budget) => sum + budget.spent,
      0
    );

    res.status(200).json({
      totalBudget,
      amountSpent,
    });
  } catch (error) {
    console.error("Error fetching budget overview:", error);
    res.status(500).json({ message: "Failed to fetch budget overview" });
  }
};
