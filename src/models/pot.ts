import mongoose, { Document, Schema } from "mongoose";

export interface IPot extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  goalAmount: number;
  currentAmount: number;
  targetDate: Date;
  description?: string;
  category?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PotSchema: Schema = new mongoose.Schema(
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
    goalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: "pots",
  }
);

// Indexes for frequent queries
PotSchema.index({ userId: 1, name: 1 }, { unique: true });
PotSchema.index({ userId: 1, category: 1 });

export default mongoose.model<IPot>("Pot", PotSchema);
