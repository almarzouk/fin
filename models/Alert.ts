import mongoose, { Schema, type Model } from "mongoose";
import type { AlertType } from "@/types";

export interface IAlert {
  title: string;
  message: string;
  type: AlertType;
  category: string;
  isRead: boolean;
  createdAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["warning", "info", "danger"],
      required: true,
    },
    category: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Alert: Model<IAlert> =
  mongoose.models.Alert ?? mongoose.model<IAlert>("Alert", alertSchema);

export default Alert;
