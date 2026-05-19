import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { refreshAllInvestmentPrices } from "@/lib/stock-prices";

export async function POST() {
  const { error } = await requireSession();
  if (error) return error;

  const result = await refreshAllInvestmentPrices();
  return NextResponse.json(result);
}
