import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { checkInvestmentLoss } from "@/lib/alerts";
import Investment from "@/models/Investment";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { currentValue } = body;

  if (currentValue == null) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await connectDB();

  const investment = await Investment.findByIdAndUpdate(
    id,
    { currentValue },
    { new: true }
  ).lean();

  if (!investment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await checkInvestmentLoss(id);

  return NextResponse.json(investment);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const deleted = await Investment.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
