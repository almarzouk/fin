import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { seedUserPortfolio } from "@/lib/portfolio-seed";
import { refreshAllInvestmentPrices } from "@/lib/stock-prices";
import { executeSavingsPlans } from "@/lib/savings-plans";

export async function POST() {
  const { error } = await requireSession();
  if (error) return error;

  await seedUserPortfolio(true);
  const prices = await refreshAllInvestmentPrices();
  const savings = await executeSavingsPlans(undefined, true);

  return NextResponse.json({
    ok: true,
    prices,
    savings,
  });
}
