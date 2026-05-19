import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import Alert from "@/models/Alert";

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  await connectDB();

  const filter = all ? {} : { isRead: false };
  const alerts = await Alert.find(filter).sort({ createdAt: -1 }).lean();

  return NextResponse.json(alerts);
}
