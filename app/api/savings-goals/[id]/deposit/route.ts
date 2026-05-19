import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import SavingsGoal from "@/models/SavingsGoal";

type Params = { params: Promise<{ id: string }> };

/** POST /api/savings-goals/:id/deposit
 *  body: { amount: number (cents), note?: string, date?: string }
 *  Positive = deposit, Negative = withdrawal
 */
export async function POST(request: Request, { params }: Params) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  try {
    await connectDB();
    const body = await request.json();
    const amount = Number(body.amount);
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    const goal = await SavingsGoal.findById(id);
    if (!goal) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // Prevent balance from going negative
    if (amount < 0 && goal.currentBalance + amount < 0) {
      return NextResponse.json({ error: "insufficient_balance" }, { status: 400 });
    }

    goal.currentBalance += amount;
    goal.deposits.push({
      amount,
      note: body.note,
      date: body.date ? new Date(body.date) : new Date(),
    });
    await goal.save();

    const plain = goal.toObject();
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

    return NextResponse.json({ ...plain, progressPercent, monthsToGoal });
  } catch (err) {
    console.error("[savings-goals deposit POST]", err);
    return NextResponse.json({ error: "deposit_failed" }, { status: 500 });
  }
}
