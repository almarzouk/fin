import type { AllocationCategory, ExpenseType } from "@/types";

export const CURRENCIES = ["EUR"] as const;

/** Salary amounts in cents */
export const SALARY_PRESETS = [
  120000, 180000, 200000, 240000, 260000, 300000, 350000, 400000, 500000,
] as const;

/** Common amounts in cents */
export const AMOUNT_PRESETS = [
  500, 1000, 1500, 2000, 2500, 3000, 3500, 4500, 4900, 5000, 7500, 8500,
  10000, 12000, 15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000,
  80000, 100000, 150000, 200000,
] as const;

export const DAYS_OF_MONTH = Array.from({ length: 28 }, (_, i) => i + 1);

export type DatePresetId = "today" | "month_start" | "month_end" | "yesterday";

export const DATE_PRESETS: DatePresetId[] = [
  "today",
  "yesterday",
  "month_start",
  "month_end",
];

export function resolveDatePreset(id: DatePresetId): string {
  const now = new Date();
  if (id === "today") return now.toISOString().split("T")[0];
  if (id === "yesterday") {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }
  if (id === "month_start") {
    return new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  }
  return new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
}

export interface ExpenseItemPreset {
  id: string;
  category: string;
  type: ExpenseType;
  defaultAmount: number;
}

export const EXPENSE_ITEM_PRESETS: ExpenseItemPreset[] = [
  { id: "rent", category: "utilities", type: "necessary", defaultAmount: 100000 },
  { id: "electricity", category: "utilities", type: "necessary", defaultAmount: 12000 },
  { id: "internet", category: "utilities", type: "necessary", defaultAmount: 4500 },
  { id: "supermarket", category: "food", type: "necessary", defaultAmount: 35000 },
  { id: "restaurant", category: "food", type: "unnecessary", defaultAmount: 4500 },
  { id: "transport_pass", category: "transport", type: "necessary", defaultAmount: 4900 },
  { id: "fuel", category: "transport", type: "necessary", defaultAmount: 8000 },
  { id: "netflix", category: "entertainment", type: "unnecessary", defaultAmount: 1599 },
  { id: "gym", category: "health", type: "necessary", defaultAmount: 3000 },
  { id: "pharmacy", category: "health", type: "necessary", defaultAmount: 2500 },
  { id: "clothing", category: "other", type: "unnecessary", defaultAmount: 8000 },
  { id: "gift", category: "other", type: "unnecessary", defaultAmount: 5000 },
];

export interface AllocationPreset {
  id: string;
  category: AllocationCategory;
  defaultAmount: number;
}

export const ALLOCATION_PRESETS: AllocationPreset[] = [
  { id: "rent", category: "fixed", defaultAmount: 100000 },
  { id: "home", category: "variable", defaultAmount: 30000 },
  { id: "investment", category: "investment", defaultAmount: 60000 },
  { id: "savings", category: "savings", defaultAmount: 40000 },
  { id: "free_spending", category: "variable", defaultAmount: 30000 },
  { id: "insurance", category: "fixed", defaultAmount: 15000 },
  { id: "subscriptions", category: "variable", defaultAmount: 5000 },
];

export interface InvestmentPreset {
  id: string;
  type: string;
  defaultAmount: number;
}

export const INVESTMENT_PRESETS: InvestmentPreset[] = [
  { id: "msci_world", type: "ETF", defaultAmount: 150000 },
  { id: "sp500", type: "ETF", defaultAmount: 100000 },
  { id: "emergency_savings", type: "savings", defaultAmount: 80000 },
  { id: "bitcoin", type: "crypto", defaultAmount: 50000 },
  { id: "apple_stock", type: "stocks", defaultAmount: 200000 },
  { id: "bond_fund", type: "other", defaultAmount: 50000 },
];

export const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "entertainment",
  "utilities",
  "health",
  "other",
] as const;

export function findExpensePreset(id: string) {
  return EXPENSE_ITEM_PRESETS.find((p) => p.id === id);
}

export function findAllocationPreset(id: string) {
  return ALLOCATION_PRESETS.find((p) => p.id === id);
}

export function findInvestmentPreset(id: string) {
  return INVESTMENT_PRESETS.find((p) => p.id === id);
}
