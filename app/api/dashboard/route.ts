import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { getCurrentMonth, getLastMonths, monthToDateRange } from "@/lib/utils";
import SalaryConfig from "@/models/SalaryConfig";
import Expense from "@/models/Expense";
import Investment from "@/models/Investment";
import Alert from "@/models/Alert";
import SavingsGoal from "@/models/SavingsGoal";
import type { FinancialHealthScore } from "@/types";

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? getCurrentMonth();

  await connectDB();

  const { start, end } = monthToDateRange(month);
  const lastMonths = getLastMonths(6);

  const [salary, expenses, investments, unreadAlerts, recentExpenses, savingsGoals] =
    await Promise.all([
      SalaryConfig.findOne({ month }).lean(),
      Expense.find({ date: { $gte: start, $lte: end } }).lean(),
      Investment.find().lean(),
      Alert.find({ isRead: false }).sort({ createdAt: -1 }).limit(10).lean(),
      Expense.find().sort({ date: -1 }).limit(5).lean(),
      SavingsGoal.find({ isActive: true }).lean(),
    ]);

  const totalSalary = salary?.amount ?? 0;
  const totalAllocated =
    salary?.allocations.reduce((s, a) => s + a.amount, 0) ?? 0;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const remainingBalance = totalSalary - totalExpenses - totalInvested;

  const unnecessary = expenses.filter((e) => e.type === "unnecessary");
  const unnecessaryExpensesCount = unnecessary.length;
  const unnecessaryExpensesTotal = unnecessary.reduce((s, e) => s + e.amount, 0);

  const categoryMap = new Map<string, number>();
  for (const e of expenses) {
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + e.amount);
  }
  const expensesByCategory = Array.from(categoryMap.entries()).map(
    ([category, total]) => ({ category, total })
  );

  const monthlyTrend = await Promise.all(
    lastMonths.map(async (m) => {
      const range = monthToDateRange(m);
      const agg = await Expense.aggregate([
        { $match: { date: { $gte: range.start, $lte: range.end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      return { month: m, total: agg[0]?.total ?? 0 };
    })
  );

  // ── Financial Health Score (0-100) ───────────────────────────────────────
  const healthScore = computeHealthScore({
    salary: totalSalary,
    monthlyInvested: totalInvested,
    unnecessaryTotal: unnecessaryExpensesTotal,
    savingsGoals,
  });

  return NextResponse.json({
    totalSalary,
    totalAllocated,
    totalExpenses,
    totalInvested,
    remainingBalance,
    unnecessaryExpensesCount,
    unnecessaryExpensesTotal,
    expensesByCategory,
    monthlyTrend,
    currency: salary?.currency ?? "EUR",
    recentExpenses,
    unreadAlerts,
    healthScore,
  });
}

function computeHealthScore(params: {
  salary: number;
  monthlyInvested: number;
  unnecessaryTotal: number;
  savingsGoals: { targetAmount: number; currentBalance: number; monthlyDeposit: number }[];
}): FinancialHealthScore {
  const { salary, monthlyInvested, unnecessaryTotal, savingsGoals } = params;
  const tips: string[] = [];

  // 1. Investment score: up to 25 pts — 20% of salary = full score
  const investRate = salary > 0 ? monthlyInvested / salary : 0;
  const investScore = Math.min(25, Math.round((investRate / 0.20) * 25));
  if (investRate < 0.10) tips.push("invest_more");
  else if (investRate >= 0.20) tips.push("invest_excellent");

  // 2. Savings fund score: up to 30 pts — 100% of primary goal = full score
  const primary = savingsGoals.find((g) => (g as { isPrimary?: boolean }).isPrimary);
  const efProgress = primary && primary.targetAmount > 0
    ? primary.currentBalance / primary.targetAmount
    : 0;
  const efScore = Math.min(30, Math.round(efProgress * 30));
  if (efProgress < 0.25) tips.push("build_emergency_fund");
  else if (efProgress >= 1) tips.push("emergency_fund_complete");

  // 3. Monthly savings contribution: up to 25 pts — €200+/month = full
  const totalMonthlyDeposit = savingsGoals.reduce((s, g) => s + g.monthlyDeposit, 0);
  const savingsScore = Math.min(25, Math.round((totalMonthlyDeposit / 20000) * 25));
  if (totalMonthlyDeposit === 0) tips.push("start_saving");

  // 4. Spending control: up to 20 pts — unnecessary < 5% of salary = full
  const unnecessaryRate = salary > 0 ? unnecessaryTotal / salary : 0;
  const spendScore = unnecessaryRate <= 0.05
    ? 20
    : unnecessaryRate <= 0.10
    ? 15
    : unnecessaryRate <= 0.15
    ? 8
    : 0;
  if (unnecessaryRate > 0.15) tips.push("reduce_unnecessary");
  else if (unnecessaryRate <= 0.05) tips.push("spending_great");

  const total = investScore + efScore + savingsScore + spendScore;

  return {
    total,
    breakdown: {
      investment: investScore,
      emergencyFund: efScore,
      savings: savingsScore,
      spending: spendScore,
    },
    tips,
  };
}
