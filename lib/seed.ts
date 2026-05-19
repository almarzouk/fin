import { connectDB } from "@/lib/db";
import { getCurrentMonth } from "@/lib/utils";
import SalaryConfig from "@/models/SalaryConfig";
import Expense from "@/models/Expense";
import Investment from "@/models/Investment";
import Alert from "@/models/Alert";
import MonthlyPlan from "@/models/MonthlyPlan";
import SavingsGoal from "@/models/SavingsGoal";
import { getDefaultMonthlyPlan } from "@/lib/monthly-plan";

import type { PlanItemId } from "@/lib/monthly-plan-items";

// ─── User's real financial data (in euro-cents) ─────────────────────────────
const USER_SALARY        = 260000; // €2,600
const USER_RENT          =  97500; // €975
const USER_ELECTRICITY   =   5700; // €57
const USER_PHONE         =   6500; // €65
const USER_INVESTMENT    =  70000; // €700
const USER_SAVINGS_FUND  =  20000; // €200/month → emergency fund
// ─────────────────────────────────────────────────────────────────────────────

export async function seedDatabaseIfEmpty(force = false): Promise<boolean> {
  await connectDB();

  const expenseCount = await Expense.countDocuments();
  if (!force && expenseCount > 0) return false;

  if (force) {
    await Promise.all([
      Expense.deleteMany({}),
      Investment.deleteMany({}),
      Alert.deleteMany({}),
      SalaryConfig.deleteMany({}),
      MonthlyPlan.deleteMany({}),
      SavingsGoal.deleteMany({}),
    ]);
  }

  const month = getCurrentMonth();
  const [year, m] = month.split("-").map(Number);

  // ── Monthly Plan with user's real fixed expenses ─────────────────────────
  const fixedItems: import("@/lib/monthly-plan-items").PlanFixedItem[] = [
    { id: "rent"              as PlanItemId, amount: USER_RENT,        dayOfMonth: 1,  enabled: true  },
    { id: "electricity"       as PlanItemId, amount: USER_ELECTRICITY, dayOfMonth: 8,  enabled: true  },
    { id: "phone_bill"        as PlanItemId, amount: USER_PHONE,       dayOfMonth: 5,  enabled: true  },
    { id: "phone_installment" as PlanItemId, amount: 0,                dayOfMonth: 15, enabled: false },
    { id: "investment"        as PlanItemId, amount: USER_INVESTMENT,  dayOfMonth: 1,  enabled: true  },
  ];
  const emergencyFund = {
    monthlyDeposit: USER_SAVINGS_FUND,
    balance: 0,
    dayOfMonth: 1,
    enabled: true,
  };

  await SalaryConfig.findOneAndUpdate(
    { month },
    {
      amount: USER_SALARY,
      currency: "EUR",
      month,
      allocations: [
        { label: "rent",          amount: USER_RENT,        category: "fixed" },
        { label: "electricity",   amount: USER_ELECTRICITY, category: "fixed" },
        { label: "phone_bill",    amount: USER_PHONE,       category: "fixed" },
        { label: "investment",    amount: USER_INVESTMENT,  category: "investment" },
        { label: "savings",       amount: USER_SAVINGS_FUND,category: "savings" },
      ],
    },
    { upsert: true }
  );

  await MonthlyPlan.deleteMany({});
  await MonthlyPlan.create({
    isActive: true,
    salaryAmount: USER_SALARY,
    currency: "EUR",
    fixedItems,
    emergencyFund,
    allocations: [],
    recurringExpenses: [],
    lastExecutedMonth: month,
  });

  // ── Demo expenses for current month ─────────────────────────────────────
  const expenseDates = [
    { title: "supermarket",   amount: 8500,  category: "food",          type: "necessary"   as const, day: 3  },
    { title: "transport_pass",amount: 4900,  category: "transport",     type: "necessary"   as const, day: 1  },
    { title: "netflix",       amount: 1599,  category: "entertainment", type: "unnecessary" as const, day: 12 },
    { title: "electricity",   amount: USER_ELECTRICITY, category: "utilities", type: "necessary" as const, day: 8 },
    { title: "restaurant",    amount: 3200,  category: "food",          type: "unnecessary" as const, day: 15 },
    { title: "rent",          amount: USER_RENT, category: "utilities", type: "necessary"   as const, day: 1  },
    { title: "phone_bill",    amount: USER_PHONE, category: "utilities", type: "necessary"  as const, day: 5  },
  ];

  for (const e of expenseDates) {
    await Expense.create({
      title: e.title,
      amount: e.amount,
      category: e.category,
      type: e.type,
      date: new Date(year, m - 1, e.day),
      isWarning: e.type === "unnecessary",
    });
  }

  await Investment.insertMany([
    {
      title: "msci_world",
      amount: USER_INVESTMENT,
      currentValue: USER_INVESTMENT,
      type: "ETF",
      startDate: new Date(year, m - 1, 1),
      note: "Monthly ETF savings plan",
    },
  ]);

  // ── Emergency / savings fund goal ────────────────────────────────────────
  const existingGoal = await SavingsGoal.findOne({ isPrimary: true });
  if (!existingGoal) {
    await SavingsGoal.create({
      name: "صندوق الطوارئ",
      emoji: "🛡️",
      targetAmount: 500000, // €5,000 target
      currentBalance: 0,
      monthlyDeposit: USER_SAVINGS_FUND,
      currency: "EUR",
      isPrimary: true,
      color: "amber",
    });
  }

  await Alert.insertMany([
    {
      title: "مرحباً بك في Finance OS",
      message: "تم إعداد بياناتك المالية. راتبك €2,600 وقد تم تكوين نفقاتك الثابتة تلقائياً.",
      type: "info",
      category: "system",
      isRead: false,
    },
  ]);

  return true;
}
