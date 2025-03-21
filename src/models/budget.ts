import mongoose, { Document, Schema } from "mongoose";

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  theme: string;
  period: "monthly" | "quarterly" | "yearly";
  startDate: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    theme: {
      type: String,
      required: true,
      default: "#000000",
    },
    period: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      default: "monthly",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: "budgets",
  }
);

// Create compound indexes for frequent queries
BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });
BudgetSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IBudget>("Budget", BudgetSchema);
