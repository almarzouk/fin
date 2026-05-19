import Alert from "@/models/Alert";
import Expense from "@/models/Expense";
import SalaryConfig from "@/models/SalaryConfig";
import Investment from "@/models/Investment";
import { getCurrentMonth, monthToDateRange } from "@/lib/utils";
import type { AlertType } from "@/types";

export async function createAlert(data: {
  title: string;
  message: string;
  type: AlertType;
  category: string;
}) {
  return Alert.create(data);
}

export async function createUnnecessaryExpenseAlert(
  title: string,
  amountCents: number
) {
  return createAlert({
    title: "Unnecessary expense",
    message: `Unnecessary expense added: ${title} (${amountCents / 100})`,
    type: "warning",
    category: "expense",
  });
}

export async function checkCategoryBudgetExceeded(
  category: string,
  month: string
) {
  const salary = await SalaryConfig.findOne({ month });
  if (!salary) return;

  const allocation = salary.allocations.find(
    (a) => a.label.toLowerCase() === category.toLowerCase() || a.category === category
  );
  if (!allocation) return;

  const { start, end } = monthToDateRange(month);
  const expenses = await Expense.aggregate([
    {
      $match: {
        category,
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const spent = expenses[0]?.total ?? 0;
  if (spent > allocation.amount) {
    const existing = await Alert.findOne({
      category: `budget-${category}-${month}`,
      isRead: false,
    });
    if (!existing) {
      await createAlert({
        title: "Budget exceeded",
        message: `Category "${category}" exceeded allocated budget for ${month}`,
        type: "danger",
        category: `budget-${category}-${month}`,
      });
    }
  }
}

export async function checkLowBalance(month: string) {
  const salary = await SalaryConfig.findOne({ month });
  if (!salary) return;

  const { start, end } = monthToDateRange(month);
  const [expenseAgg, investments] = await Promise.all([
    Expense.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Investment.find(),
  ]);

  const totalExpenses = expenseAgg[0]?.total ?? 0;
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const remaining = salary.amount - totalExpenses - totalInvested;
  const threshold = salary.amount * 0.1;

  if (remaining < threshold) {
    const existing = await Alert.findOne({
      category: `low-balance-${month}`,
      isRead: false,
    });
    if (!existing) {
      await createAlert({
        title: "Low balance",
        message: `Remaining balance is below 10% of salary for ${month}`,
        type: "danger",
        category: `low-balance-${month}`,
      });
    }
  }
}

export async function checkInvestmentLoss(investmentId: string) {
  const inv = await Investment.findById(investmentId);
  if (!inv || inv.currentValue >= inv.amount) return;

  const existing = await Alert.findOne({
    category: `investment-loss-${investmentId}`,
    isRead: false,
  });
  if (!existing) {
    await createAlert({
      title: "Investment loss",
      message: `Investment "${inv.title}" current value is below invested amount`,
      type: "warning",
      category: `investment-loss-${investmentId}`,
    });
  }
}

export async function runPostExpenseChecks(category: string) {
  const month = getCurrentMonth();
  await Promise.all([
    checkCategoryBudgetExceeded(category, month),
    checkLowBalance(month),
  ]);
}
