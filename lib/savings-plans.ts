import { connectDB } from "@/lib/db";
import { getCurrentMonth } from "@/lib/utils";
import { fetchPriceEurCents } from "@/lib/stock-prices";
import SavingsPlan from "@/models/SavingsPlan";
import Investment from "@/models/Investment";
import Expense from "@/models/Expense";

export async function executeSavingsPlans(month = getCurrentMonth(), force = false) {
  await connectDB();
  const plans = await SavingsPlan.find({ isActive: true });
  const executed: string[] = [];
  const skipped: string[] = [];

  for (const plan of plans) {
    if (!force && plan.lastExecutedMonth === month) {
      skipped.push(plan.assetId);
      continue;
    }

    const inv = await Investment.findOne({ assetId: plan.assetId });
    if (!inv) {
      skipped.push(plan.assetId);
      continue;
    }

    inv.amount += plan.monthlyAmount;

    const priceCents = inv.ticker
      ? await fetchPriceEurCents(inv.ticker)
      : null;

    if (priceCents && priceCents > 0) {
      const newShares = plan.monthlyAmount / priceCents;
      inv.shares = (inv.shares ?? 0) + newShares;
      inv.priceEur = priceCents;
      inv.currentValue = Math.round(inv.shares * priceCents);
      inv.lastPriceUpdate = new Date();
    } else {
      inv.currentValue += plan.monthlyAmount;
    }

    await inv.save();

    const [year, m] = month.split("-").map(Number);
    await Expense.create({
      title: plan.title,
      amount: plan.monthlyAmount,
      category: "other",
      type: "investment",
      date: new Date(year, m - 1, plan.dayOfMonth),
      note: `Savings plan: ${plan.ticker}`,
      isWarning: false,
    });

    plan.lastExecutedMonth = month;
    await plan.save();
    executed.push(plan.assetId);
  }

  return { executed, skipped, month };
}
