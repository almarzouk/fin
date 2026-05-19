import {
  normalizePlanShape,
  type PlanShapeInput,
  type PlanItemId,
} from "@/lib/monthly-plan-items";

export type BreakdownKind = "fixed" | "investment" | "emergency" | "free";

export interface SalarySlice {
  id: string;
  kind: BreakdownKind;
  amount: number;
  percent: number;
}

export function computeSalaryBreakdown(plan: PlanShapeInput): {
  salary: number;
  committed: number;
  remaining: number;
  slices: SalarySlice[];
  isOverBudget: boolean;
} {
  const normalized = normalizePlanShape(plan);
  const salary = normalized.salaryAmount;
  const slices: SalarySlice[] = [];

  for (const item of normalized.fixedItems) {
    if (!item.enabled || item.amount <= 0) continue;
    slices.push({
      id: item.id,
      kind: item.id === "investment" ? "investment" : "fixed",
      amount: item.amount,
      percent: 0,
    });
  }

  const ef = normalized.emergencyFund;
  if (ef.enabled && ef.monthlyDeposit > 0) {
    slices.push({
      id: "emergency_fund",
      kind: "emergency",
      amount: ef.monthlyDeposit,
      percent: 0,
    });
  }

  const committed = slices.reduce((s, x) => s + x.amount, 0);
  const remaining = salary - committed;

  if (remaining > 0) {
    slices.push({
      id: "free_spending",
      kind: "free",
      amount: remaining,
      percent: 0,
    });
  }

  const withPercent = slices.map((s) => ({
    ...s,
    percent: salary > 0 ? Math.round((s.amount / salary) * 1000) / 10 : 0,
  }));

  return {
    salary,
    committed,
    remaining,
    slices: withPercent,
    isOverBudget: remaining < 0,
  };
}

export const SLICE_COLORS: Record<BreakdownKind, string> = {
  fixed: "bg-blue-500",
  investment: "bg-violet-500",
  emergency: "bg-amber-500",
  free: "bg-green-500",
};
