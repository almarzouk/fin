import type { IMonthlyPlan } from "@/models/MonthlyPlan";

export type VorlageId = "standard" | "student" | "family" | "minimalist";

export interface PlanVorlage {
  id: VorlageId;
  salaryAmount: number;
  currency: string;
  allocations: IMonthlyPlan["allocations"];
  recurringExpenses: IMonthlyPlan["recurringExpenses"];
}

export const PLAN_VORLAGEN: Record<VorlageId, PlanVorlage> = {
  standard: {
    id: "standard",
    salaryAmount: 260000,
    currency: "EUR",
    allocations: [
      { label: "rent", amount: 100000, category: "fixed" },
      { label: "home", amount: 30000, category: "variable" },
      { label: "investment", amount: 60000, category: "investment" },
      { label: "savings", amount: 40000, category: "savings" },
      { label: "free_spending", amount: 30000, category: "variable" },
    ],
    recurringExpenses: [
      { title: "rent", amount: 100000, category: "utilities", type: "necessary", dayOfMonth: 1 },
      { title: "internet", amount: 4500, category: "utilities", type: "necessary", dayOfMonth: 5 },
      { title: "supermarket", amount: 35000, category: "food", type: "necessary", dayOfMonth: 10 },
      { title: "transport_pass", amount: 4900, category: "transport", type: "necessary", dayOfMonth: 1 },
    ],
  },
  student: {
    id: "student",
    salaryAmount: 120000,
    currency: "EUR",
    allocations: [
      { label: "rent", amount: 45000, category: "fixed" },
      { label: "food", amount: 25000, category: "variable" },
      { label: "transport", amount: 4900, category: "fixed" },
      { label: "savings", amount: 10000, category: "savings" },
      { label: "free_spending", amount: 15000, category: "variable" },
    ],
    recurringExpenses: [
      { title: "rent", amount: 45000, category: "utilities", type: "necessary", dayOfMonth: 1 },
      { title: "supermarket", amount: 20000, category: "food", type: "necessary", dayOfMonth: 5 },
      { title: "transport_pass", amount: 4900, category: "transport", type: "necessary", dayOfMonth: 1 },
      { title: "netflix", amount: 1599, category: "entertainment", type: "unnecessary", dayOfMonth: 15 },
    ],
  },
  family: {
    id: "family",
    salaryAmount: 450000,
    currency: "EUR",
    allocations: [
      { label: "rent", amount: 150000, category: "fixed" },
      { label: "home", amount: 60000, category: "variable" },
      { label: "insurance", amount: 20000, category: "fixed" },
      { label: "investment", amount: 80000, category: "investment" },
      { label: "savings", amount: 50000, category: "savings" },
      { label: "free_spending", amount: 40000, category: "variable" },
    ],
    recurringExpenses: [
      { title: "rent", amount: 150000, category: "utilities", type: "necessary", dayOfMonth: 1 },
      { title: "electricity", amount: 18000, category: "utilities", type: "necessary", dayOfMonth: 8 },
      { title: "supermarket", amount: 70000, category: "food", type: "necessary", dayOfMonth: 5 },
      { title: "transport_pass", amount: 9800, category: "transport", type: "necessary", dayOfMonth: 1 },
      { title: "insurance", amount: 20000, category: "other", type: "necessary", dayOfMonth: 12 },
    ],
  },
  minimalist: {
    id: "minimalist",
    salaryAmount: 200000,
    currency: "EUR",
    allocations: [
      { label: "rent", amount: 70000, category: "fixed" },
      { label: "home", amount: 15000, category: "variable" },
      { label: "savings", amount: 80000, category: "savings" },
      { label: "investment", amount: 25000, category: "investment" },
      { label: "free_spending", amount: 10000, category: "variable" },
    ],
    recurringExpenses: [
      { title: "rent", amount: 70000, category: "utilities", type: "necessary", dayOfMonth: 1 },
      { title: "supermarket", amount: 20000, category: "food", type: "necessary", dayOfMonth: 10 },
      { title: "transport_pass", amount: 4900, category: "transport", type: "necessary", dayOfMonth: 1 },
    ],
  },
};

export const VORLAGE_IDS = Object.keys(PLAN_VORLAGEN) as VorlageId[];

export function applyVorlage(id: VorlageId) {
  const v = PLAN_VORLAGEN[id];
  return {
    isActive: true,
    salaryAmount: v.salaryAmount,
    currency: v.currency,
    allocations: v.allocations.map((a) => ({ ...a })),
    recurringExpenses: v.recurringExpenses.map((r) => ({ ...r })),
  };
}
