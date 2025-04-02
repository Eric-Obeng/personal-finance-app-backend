import { Request, Response } from "express";
import transactionService from "../services/transaction.service";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const getRecurringBillsSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Fetch all recurring transactions for the user
    const recurringTransactions =
      await transactionService.getRecurringTransactions(userId);

    const now = new Date();

    // Calculate total paid bills
    const totalPaidBills = recurringTransactions.filter(
      (t) => t.date < now
    ).length;

    // Calculate total upcoming bills
    const totalUpcomingBills = recurringTransactions.filter(
      (t) => t.date >= now
    ).length;

    // Get bills due soon (within the next 7 days)
    const billsDueSoon = recurringTransactions.filter((t) => {
      const dueDate = new Date(t.date);
      return (
        dueDate >= now &&
        dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    res.status(200).json({
      totalPaidBills,
      totalUpcomingBills,
      billsDueSoon: billsDueSoon.map((bill) => ({
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.date,
      })),
    });
  } catch (error) {
    console.error("Error fetching recurring bills summary:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch recurring bills summary" });
  }
};
