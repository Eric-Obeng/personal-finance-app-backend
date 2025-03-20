import mongoose, { Document, Schema } from "mongoose";
import helmet from "helmet";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description?: string;
  date: Date;
  recurring: boolean;
  recurringFrequency?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  avatar?: string;
  budgetId?: mongoose.Types.ObjectId;
  potId?: mongoose.Types.ObjectId;
  parentTransactionId?: mongoose.Types.ObjectId;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    budgetId: {
      type: Schema.Types.ObjectId,
      ref: "Budget",
    },
    potId: {
      type: Schema.Types.ObjectId,
      ref: "Pot",
    },
    parentTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },
    tags: [
      {
        type: String,
      },
    ],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: "transactions",
  }
);

// Create compound index for frequent queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, isDeleted: 1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ recurring: 1 }, { sparse: true });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
