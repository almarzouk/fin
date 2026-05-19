import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import SavingsGoal from "@/models/SavingsGoal";

function computeExtra(goal: {
  targetAmount: number;
  currentBalance: number;
  monthlyDeposit: number;
}) {
  const progressPercent =
    goal.targetAmount > 0
      ? Math.min(100, Math.round((goal.currentBalance / goal.targetAmount) * 100))
      : 0;
  const remaining = goal.targetAmount - goal.currentBalance;
  const monthsToGoal =
    goal.monthlyDeposit > 0 && remaining > 0
      ? Math.ceil(remaining / goal.monthlyDeposit)
      : goal.currentBalance >= goal.targetAmount
      ? 0
      : null;
  return { progressPercent, monthsToGoal };
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  const goal = await SavingsGoal.findById(id).lean();
  if (!goal) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ...goal, ...computeExtra(goal) });
}

export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  try {
    await connectDB();
    const body = await request.json();

    const allowedFields: Record<string, unknown> = {};
    if (body.name !== undefined) allowedFields.name = body.name;
    if (body.emoji !== undefined) allowedFields.emoji = body.emoji;
    if (body.targetAmount !== undefined) allowedFields.targetAmount = body.targetAmount;
    if (body.monthlyDeposit !== undefined) allowedFields.monthlyDeposit = body.monthlyDeposit;
    if (body.currency !== undefined) allowedFields.currency = body.currency;
    if (body.isActive !== undefined) allowedFields.isActive = body.isActive;
    if (body.color !== undefined) allowedFields.color = body.color;

    const goal = await SavingsGoal.findByIdAndUpdate(
      id,
      { $set: allowedFields },
      { new: true, runValidators: true }
    ).lean();

    if (!goal) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ...goal, ...computeExtra(goal) });
  } catch (err) {
    console.error("[savings-goals PUT]", err);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  const goal = await SavingsGoal.findByIdAndDelete(id);
  if (!goal) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
