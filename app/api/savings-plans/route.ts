import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { daysUntilNextExecution } from "@/lib/stock-prices";
import SavingsPlan from "@/models/SavingsPlan";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  await connectDB();
  const plans = await SavingsPlan.find({ isActive: true }).sort({
    monthlyAmount: -1,
  }).lean();

  const withDays = plans.map((p) => ({
    ...p,
    daysUntil: daysUntilNextExecution(p.dayOfMonth),
  }));

  return NextResponse.json(withDays);
}
