import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { executeMonthlyPlan } from "@/lib/monthly-plan";
import { getCurrentMonth } from "@/lib/utils";

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const month = body.month ?? getCurrentMonth();
  const force = body.force === true;

  const result = await executeMonthlyPlan(month, force);
  return NextResponse.json(result);
}
