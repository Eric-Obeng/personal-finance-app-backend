import mongoose, { Document, Schema } from "mongoose";

export interface IPot extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  goalAmount: number;
  currentAmount: number;
  targetDate: Date;
  description?: string;
  category?: string;
  theme: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  progress: number; // Changed from optional to required
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
    theme: {
      type: String,
      required: true,
      default: "#000000",
      validate: {
        validator: function (v: string) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Theme must be a valid hex color code",
      },
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: "pots",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add virtual field for progress with proper typing
PotSchema.virtual("progress").get(function (this: IPot) {
  return Math.round((this.currentAmount / this.goalAmount) * 100);
});

// Pre-save middleware with proper typing
PotSchema.pre<IPot>("save", function (next) {
  if (this.currentAmount > this.goalAmount) {
    this.currentAmount = this.goalAmount;
  }
  next();
});

// Pre-update middleware with proper typing
PotSchema.pre("findOneAndUpdate", function (this: any, next) {
  const update = this.getUpdate() as {
    $set?: { currentAmount: number; goalAmount: number };
  };
  if (update.$set && update.$set.currentAmount > update.$set.goalAmount) {
    update.$set.currentAmount = update.$set.goalAmount;
  }
  next();
});

// Indexes for frequent queries
PotSchema.index({ userId: 1, name: 1 }, { unique: true });
PotSchema.index({ userId: 1, category: 1 });

export default mongoose.model<IPot>("Pot", PotSchema);
