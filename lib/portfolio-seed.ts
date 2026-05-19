import { connectDB } from "@/lib/db";
import {
  PORTFOLIO_ASSETS,
  PORTFOLIO_HOLDINGS,
  getAssetsWithSavingsPlan,
} from "@/lib/portfolio-catalog";
import Investment from "@/models/Investment";
import SavingsPlan from "@/models/SavingsPlan";
import { getCurrentMonth } from "@/lib/utils";

export async function seedUserPortfolio(force = false): Promise<boolean> {
  await connectDB();

  const hasPortfolio = await Investment.findOne({
    $or: [{ assetId: { $exists: true } }, { ticker: { $exists: true, $ne: null } }],
  });
  if (hasPortfolio && !force) return false;

  if (force) {
    await Investment.deleteMany({
      $or: [{ assetId: { $exists: true } }, { ticker: { $exists: true } }],
    });
    await SavingsPlan.deleteMany({});
  }

  const month = getCurrentMonth();

  for (const h of PORTFOLIO_HOLDINGS) {
    const asset = PORTFOLIO_ASSETS.find((a) => a.id === h.id);
    if (!asset) continue;

    await Investment.findOneAndUpdate(
      { title: h.id },
      {
        title: h.id,
        assetId: h.id,
        ticker: asset.ticker,
        shares: h.shares,
        amount: h.amountCents,
        currentValue: h.currentValueCents,
        type: asset.type,
        startDate: new Date(2024, 0, 1),
        priceEur:
          h.shares > 0 ? Math.round(h.currentValueCents / h.shares) : undefined,
        lastPriceUpdate: new Date(),
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  for (const asset of getAssetsWithSavingsPlan()) {
    await SavingsPlan.findOneAndUpdate(
      { assetId: asset.id },
      {
        assetId: asset.id,
        ticker: asset.ticker,
        title: asset.id,
        monthlyAmount: asset.monthlyPlanCents,
        dayOfMonth: asset.dayOfMonth,
        isActive: true,
        lastExecutedMonth: month,
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  return true;
}
