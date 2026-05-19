import type { Dictionary } from "@/messages/de";

export function labelForExpense(t: Dictionary, id: string) {
  const items = t.presets.expenseItems as Record<string, string>;
  return items[id] ?? id;
}

export function labelForAllocation(t: Dictionary, id: string) {
  const items = t.presets.allocations as Record<string, string>;
  return items[id] ?? id;
}

export function labelForInvestment(t: Dictionary, id: string) {
  const items = t.presets.investments as Record<string, string>;
  return items[id] ?? id;
}

export function labelForPlanItem(t: Dictionary, id: string) {
  const items = t.monthlyPlan.items as Record<string, string>;
  return items[id] ?? id;
}
