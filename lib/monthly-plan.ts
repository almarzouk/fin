import { connectDB } from "@/lib/db";
import { getCurrentMonth, monthToDateRange } from "@/lib/utils";
import { checkLowBalance } from "@/lib/alerts";
import SalaryConfig from "@/models/SalaryConfig";
import Expense from "@/models/Expense";
import MonthlyPlan, { type IMonthlyPlan } from "@/models/MonthlyPlan";
import {
  buildDefaultEmergencyFund,
  buildDefaultFixedItems,
  normalizePlanShape,
  planNeedsLegacyMigration,
  planHasStaleLegacy,
  getItemDefinition,
} from "@/lib/monthly-plan-items";

export function getDefaultMonthlyPlan(): Omit<
  IMonthlyPlan,
  "_id" | "lastExecutedMonth" | "createdAt" | "updatedAt"
> {
  return {
    isActive: true,
    salaryAmount: 0,
    currency: "EUR",
    fixedItems: buildDefaultFixedItems(),
    emergencyFund: buildDefaultEmergencyFund(),
    allocations: [],
    recurringExpenses: [],
  };
}

export function normalizePlan(plan: IMonthlyPlan): IMonthlyPlan {
  return normalizePlanShape(plan) as IMonthlyPlan;
}

export async function getOrCreateMonthlyPlan() {
  await connectDB();
  let plan = await MonthlyPlan.findOne();
  if (!plan) {
    plan = await MonthlyPlan.create(getDefaultMonthlyPlan());
    return plan;
  }

  const raw = plan.toObject() as Parameters<typeof normalizePlanShape>[0];
  if (planNeedsLegacyMigration(raw)) {
    const normalized = normalizePlanShape(raw);
    plan.fixedItems = normalized.fixedItems;
    plan.emergencyFund = normalized.emergencyFund;
    plan.recurringExpenses = [];
    plan.allocations = [];
    plan.markModified("fixedItems");
    plan.markModified("emergencyFund");
    await plan.save();
  } else if (planHasStaleLegacy(raw)) {
    plan.recurringExpenses = [];
    plan.allocations = [];
    await plan.save();
  }

  return plan;
}

export async function executeMonthlyPlan(
  month: string = getCurrentMonth(),
  force = false
): Promise<{ executed: boolean; month: string; message: string }> {
  await connectDB();
  const plan = normalizePlan((await getOrCreateMonthlyPlan()).toObject());

  if (!plan.isActive) {
    return { executed: false, month, message: "plan_inactive" };
  }

  if (!force && plan.lastExecutedMonth === month) {
    return { executed: false, month, message: "already_executed" };
  }

  const [year, m] = month.split("-").map(Number);
  const { start, end } = monthToDateRange(month);

  const allocationsFromPlan: {
    label: string;
    amount: number;
    category: "fixed" | "investment" | "savings" | "variable";
  }[] = plan.fixedItems
    .filter((f) => f.enabled && f.amount > 0)
    .map((f) => {
      const def = getItemDefinition(f.id);
      return {
        label: f.id,
        amount: f.amount,
        category:
          f.id === "investment"
            ? ("investment" as const)
            : def?.type === "investment"
              ? ("investment" as const)
              : ("fixed" as const),
      };
    });

  if (plan.emergencyFund.enabled && plan.emergencyFund.monthlyDeposit > 0) {
    allocationsFromPlan.push({
      label: "emergency_fund",
      amount: plan.emergencyFund.monthlyDeposit,
      category: "savings",
    });
  }

  await SalaryConfig.findOneAndUpdate(
    { month },
    {
      amount: plan.salaryAmount,
      currency: plan.currency,
      month,
      allocations: allocationsFromPlan,
    },
    { upsert: true, new: true }
  );

  for (const item of plan.fixedItems) {
    if (!item.enabled || item.amount <= 0) continue;
    const def = getItemDefinition(item.id);
    if (!def) continue;

    const exists = await Expense.findOne({
      title: item.id,
      date: { $gte: start, $lte: end },
    });

    if (!exists) {
      await Expense.create({
        title: item.id,
        amount: item.amount,
        category: def.category,
        type: def.type,
        date: new Date(year, m - 1, Math.min(item.dayOfMonth, 28)),
        isWarning: false,
        note: "Monthly plan",
      });
    }
  }

  if (plan.emergencyFund.enabled && plan.emergencyFund.monthlyDeposit > 0) {
    const efExists = await Expense.findOne({
      title: "emergency_fund",
      date: { $gte: start, $lte: end },
    });

    if (!efExists) {
      await Expense.create({
        title: "emergency_fund",
        amount: plan.emergencyFund.monthlyDeposit,
        category: "other",
        type: "necessary",
        date: new Date(
          year,
          m - 1,
          Math.min(plan.emergencyFund.dayOfMonth, 28)
        ),
        note: "Emergency fund deposit",
        isWarning: false,
      });
    }

    const doc = await MonthlyPlan.findOne();
    if (doc) {
      doc.emergencyFund.balance += plan.emergencyFund.monthlyDeposit;
      await doc.save();
    }
  }

  const doc = await MonthlyPlan.findOne();
  if (doc) {
    doc.lastExecutedMonth = month;
    await doc.save();
  }

  await checkLowBalance(month);

  return { executed: true, month, message: "success" };
}

export async function autoRunMonthlyPlanAndSeed() {
  const { seedDatabaseIfEmpty } = await import("@/lib/seed");
  const seeded = await seedDatabaseIfEmpty();
  const result = await executeMonthlyPlan();
  return { seeded, ...result };
}
