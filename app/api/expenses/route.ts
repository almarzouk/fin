import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import {
  createUnnecessaryExpenseAlert,
  runPostExpenseChecks,
} from "@/lib/alerts";
import { getCurrentMonth, monthToDateRange } from "@/lib/utils";
import Expense from "@/models/Expense";

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const category = searchParams.get("category");
  const type = searchParams.get("type");

  await connectDB();

  const filter: Record<string, unknown> = {};

  if (month) {
    const { start, end } = monthToDateRange(month);
    filter.date = { $gte: start, $lte: end };
  }
  if (category && category !== "all") filter.category = category;
  if (type && type !== "all") filter.type = type;

  const expenses = await Expense.find(filter).sort({ date: -1 }).lean();

  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const body = await request.json();
  const { title, amount, category, type, date, note } = body;

  if (!title || amount == null || !category || !type || !date) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const isWarning = type === "unnecessary";

  await connectDB();

  const expense = await Expense.create({
    title,
    amount,
    category,
    type,
    date: new Date(date),
    note,
    isWarning,
  });

  if (type === "unnecessary") {
    await createUnnecessaryExpenseAlert(title, amount);
  }

  await runPostExpenseChecks(category);

  return NextResponse.json(expense, { status: 201 });
}
