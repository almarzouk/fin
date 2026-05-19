import mongoose, { Schema, type Model } from "mongoose";

export interface IDeposit {
  amount: number; // in cents, negative = withdrawal
  note?: string;
  date: Date;
}

export interface ISavingsGoal {
  name: string;
  emoji: string;
  targetAmount: number; // in cents
  currentBalance: number; // in cents
  monthlyDeposit: number; // planned monthly contribution in cents
  currency: string;
  isActive: boolean;
  isPrimary: boolean; // true = emergency fund (main goal)
  color: string; // tailwind color token
  deposits: IDeposit[];
  createdAt: Date;
  updatedAt: Date;
}

const depositSchema = new Schema<IDeposit>(
  {
    amount: { type: Number, required: true },
    note: { type: String },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const savingsGoalSchema = new Schema<ISavingsGoal>(
  {
    name: { type: String, required: true },
    emoji: { type: String, default: "🎯" },
    targetAmount: { type: Number, required: true },
    currentBalance: { type: Number, default: 0 },
    monthlyDeposit: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },
    isActive: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false },
    color: { type: String, default: "amber" },
    deposits: { type: [depositSchema], default: [] },
  },
  { timestamps: true }
);

savingsGoalSchema.index({ isPrimary: 1 });

const MODEL_NAME = "SavingsGoal";

const SavingsGoal: Model<ISavingsGoal> =
  mongoose.models[MODEL_NAME] ??
  mongoose.model<ISavingsGoal>(MODEL_NAME, savingsGoalSchema);

export default SavingsGoal;
