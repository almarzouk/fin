import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { checkInvestmentLoss } from "@/lib/alerts";
import Investment from "@/models/Investment";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;

  await connectDB();
  const investments = await Investment.find().sort({ createdAt: -1 }).lean();

  return NextResponse.json(investments);
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const body = await request.json();
  const { title, amount, currentValue, type, startDate, note } = body;

  if (!title || amount == null || !type || !startDate) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const value = currentValue ?? amount;

  await connectDB();

  const investment = await Investment.create({
    title,
    amount,
    currentValue: value,
    type,
    startDate: new Date(startDate),
    note,
  });

  if (value < amount) {
    await checkInvestmentLoss(String(investment._id));
  }

  return NextResponse.json(investment, { status: 201 });
}
