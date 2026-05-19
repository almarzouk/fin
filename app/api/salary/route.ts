import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { getCurrentMonth } from "@/lib/utils";
import SalaryConfig from "@/models/SalaryConfig";

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? getCurrentMonth();

  await connectDB();
  const config = await SalaryConfig.findOne({ month }).lean();

  return NextResponse.json(config ?? null);
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const body = await request.json();
  const { amount, currency = "EUR", month, allocations } = body;

  if (!amount || !month || !Array.isArray(allocations)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await connectDB();

  const config = await SalaryConfig.findOneAndUpdate(
    { month },
    { amount, currency, month, allocations },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json(config);
}
