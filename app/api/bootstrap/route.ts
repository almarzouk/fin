import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { autoRunMonthlyPlanAndSeed } from "@/lib/monthly-plan";

/** Single lightweight call: seed if empty + auto-run monthly plan */
export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const { seedDatabaseIfEmpty } = await import("@/lib/seed");
  const { executeMonthlyPlan } = await import("@/lib/monthly-plan");

  if (body.forceSeed) {
    const seeded = await seedDatabaseIfEmpty(true);
    const { seedUserPortfolio } = await import("@/lib/portfolio-seed");
    await seedUserPortfolio(true);
    const planResult = await executeMonthlyPlan(undefined, true);
    return NextResponse.json({ seeded, portfolio: true, ...planResult });
  }

  const { autoRunMonthlyPlanAndSeed } = await import("@/lib/monthly-plan");
  const { seedUserPortfolio } = await import("@/lib/portfolio-seed");
  const { executeSavingsPlans } = await import("@/lib/savings-plans");
  const { refreshAllInvestmentPrices } = await import("@/lib/stock-prices");

  const result = await autoRunMonthlyPlanAndSeed();

  let portfolio = false;
  let portfolioError: string | undefined;
  try {
    portfolio = await seedUserPortfolio(false);
  } catch (err) {
    console.error("[bootstrap] portfolio seed failed:", err);
    portfolioError =
      err instanceof Error ? err.message : "portfolio_seed_failed";
  }

  let savings: Awaited<ReturnType<typeof executeSavingsPlans>> | null = null;
  try {
    savings = await executeSavingsPlans();
  } catch (err) {
    console.error("[bootstrap] savings plans failed:", err);
  }

  let prices = { updated: 0, errors: [] as string[] };
  try {
    prices = await refreshAllInvestmentPrices();
  } catch {
    /* Yahoo may rate-limit; portfolio still works with last values */
  }

  return NextResponse.json({
    ...result,
    portfolio,
    portfolioError,
    savings,
    prices,
  });
}
