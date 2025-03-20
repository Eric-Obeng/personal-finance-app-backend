import cron from "node-cron";
import Transaction from "../models/transaction";
import transactionService from "../services/transaction.service";
import { RecurringFrequency } from "../types/transaction.types";

class RecurringTransactionWorker {
  private static instance: RecurringTransactionWorker;
  private isRunning: boolean = false;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): RecurringTransactionWorker {
    if (!RecurringTransactionWorker.instance) {
      RecurringTransactionWorker.instance = new RecurringTransactionWorker();
    }
    return RecurringTransactionWorker.instance;
  }

  /**
   * Start the recurring transaction worker
   */
  public start(): void {
    if (this.isRunning) {
      console.log("Recurring transaction worker is already running");
      return;
    }

    // Run daily at midnight
    cron.schedule("0 0 * * *", async () => {
      try {
        await this.processRecurringTransactions();
      } catch (error) {
        console.error("Error processing recurring transactions:", error);
      }
    });

    this.isRunning = true;
    console.log("Recurring transaction worker started");
  }

  /**
   * Stop the recurring transaction worker
   */
  public stop(): void {
    this.isRunning = false;
    console.log("Recurring transaction worker stopped");
  }

  /**
   * Process all recurring transactions
   */
  private async processRecurringTransactions(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all recurring transactions
    const recurringTransactions = await Transaction.find({
      recurring: true,
      isDeleted: false,
      date: { $lte: today },
    });

    for (const transaction of recurringTransactions) {
      try {
        await this.processTransaction(transaction);
      } catch (error) {
        console.error(
          `Error processing recurring transaction ${transaction._id}:`,
          error
        );
      }
    }
  }

  /**
   * Process a single recurring transaction
   */
  private async processTransaction(transaction: any): Promise<void> {
    const nextDate = this.calculateNextDate(
      transaction.date,
      transaction.recurringFrequency
    );

    // Skip if next date is in the future
    if (nextDate > new Date()) {
      return;
    }

    // Create new instance of the transaction
    await transactionService.createRecurringInstance(transaction._id, nextDate);
  }

  /**
   * Calculate the next occurrence date based on frequency
   */
  private calculateNextDate(
    currentDate: Date,
    frequency: RecurringFrequency
  ): Date {
    const date = new Date(currentDate);

    switch (frequency) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        throw new Error(`Invalid frequency: ${frequency}`);
    }

    return date;
  }
}

export default RecurringTransactionWorker.getInstance();
