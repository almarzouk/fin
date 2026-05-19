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

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  await connectDB();
  const goals = await SavingsGoal.find().sort({ isPrimary: -1, createdAt: 1 }).lean();

  return NextResponse.json(
    goals.map((g) => ({ ...g, ...computeExtra(g) }))
  );
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    await connectDB();
    const body = await request.json();

    const goal = await SavingsGoal.create({
      name: body.name,
      emoji: body.emoji ?? "🎯",
      targetAmount: body.targetAmount,
      currentBalance: body.currentBalance ?? 0,
      monthlyDeposit: body.monthlyDeposit ?? 0,
      currency: body.currency ?? "EUR",
      isPrimary: body.isPrimary ?? false,
      color: body.color ?? "amber",
    });

    const plain = goal.toObject();
    return NextResponse.json({ ...plain, ...computeExtra(plain) }, { status: 201 });
  } catch (err) {
    console.error("[savings-goals POST]", err);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
