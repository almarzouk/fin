import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { getOrCreateMonthlyPlan } from "@/lib/monthly-plan";
import {
  buildDefaultEmergencyFund,
  buildDefaultFixedItems,
  normalizePlanShape,
} from "@/lib/monthly-plan-items";
import MonthlyPlan from "@/models/MonthlyPlan";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  const plan = await getOrCreateMonthlyPlan();
  return NextResponse.json(normalizePlanShape(plan.toObject()));
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    await connectDB();
    await getOrCreateMonthlyPlan();

    const body = await request.json();

    const fixedItems =
      body.fixedItems !== undefined ? body.fixedItems : buildDefaultFixedItems();

    const emergencyFund = {
      ...buildDefaultEmergencyFund(),
      ...(body.emergencyFund ?? {}),
    };

    const update: Record<string, unknown> = {
      fixedItems,
      emergencyFund,
      recurringExpenses: [],
      allocations: [],
    };

    if (body.isActive !== undefined) update.isActive = body.isActive;
    if (body.salaryAmount !== undefined) update.salaryAmount = body.salaryAmount;
    if (body.currency !== undefined) update.currency = body.currency;

    const plan = await MonthlyPlan.findOneAndUpdate(
      {},
      { $set: update },
      { returnDocument: "after", runValidators: true }
    );

    if (!plan) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json(normalizePlanShape(plan.toObject()));
  } catch (err) {
    console.error("[monthly-plan POST]", err);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
