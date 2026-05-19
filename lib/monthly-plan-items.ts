import type { ExpenseType } from "@/types";

export type PlanItemId =
  | "rent"
  | "electricity"
  | "phone_bill"
  | "phone_installment"
  | "investment";

export interface PlanItemDefinition {
  id: PlanItemId;
  category: string;
  type: ExpenseType;
  defaultDay: number;
}

/** Fixed monthly plan rows — labels come from i18n */
export const PLAN_ITEM_DEFINITIONS: PlanItemDefinition[] = [
  { id: "rent", category: "utilities", type: "necessary", defaultDay: 1 },
  { id: "electricity", category: "utilities", type: "necessary", defaultDay: 8 },
  { id: "phone_bill", category: "utilities", type: "necessary", defaultDay: 5 },
  { id: "phone_installment", category: "other", type: "necessary", defaultDay: 15 },
  { id: "investment", category: "other", type: "investment", defaultDay: 1 },
];

export interface PlanFixedItem {
  id: PlanItemId;
  amount: number;
  dayOfMonth: number;
  enabled: boolean;
}

export interface EmergencyFundSettings {
  monthlyDeposit: number;
  balance: number;
  dayOfMonth: number;
  enabled: boolean;
}

export function buildDefaultFixedItems(): PlanFixedItem[] {
  return PLAN_ITEM_DEFINITIONS.map((d) => ({
    id: d.id,
    amount: 0,
    dayOfMonth: d.defaultDay,
    enabled: true,
  }));
}

export function buildDefaultEmergencyFund(): EmergencyFundSettings {
  return {
    monthlyDeposit: 0,
    balance: 0,
    dayOfMonth: 1,
    enabled: true,
  };
}

export function getItemDefinition(id: string) {
  return PLAN_ITEM_DEFINITIONS.find((d) => d.id === id);
}

/** Legacy MongoDB fields (pre–fixedItems schema) */
export type LegacyRecurringExpense = {
  title: string;
  amount: number;
  dayOfMonth: number;
};

export type LegacyAllocation = {
  label: string;
  amount: number;
  category?: string;
};

export type PlanShapeInput = {
  isActive?: boolean;
  salaryAmount?: number;
  currency?: string;
  fixedItems?: PlanFixedItem[];
  emergencyFund?: Partial<EmergencyFundSettings>;
  recurringExpenses?: LegacyRecurringExpense[];
  allocations?: LegacyAllocation[];
  lastExecutedMonth?: string;
};

const LEGACY_KEY_TO_ITEM_ID: Record<string, PlanItemId> = {
  rent: "rent",
  electricity: "electricity",
  phone_bill: "phone_bill",
  phone: "phone_bill",
  internet: "phone_bill",
  phone_installment: "phone_installment",
  installment: "phone_installment",
  investment: "investment",
  invest: "investment",
};

function legacyKeyToItemId(key: string): PlanItemId | undefined {
  if (PLAN_ITEM_DEFINITIONS.some((d) => d.id === key)) {
    return key as PlanItemId;
  }
  return LEGACY_KEY_TO_ITEM_ID[key];
}

function mergeLegacyIntoItems(
  byId: Map<string, PlanFixedItem>,
  legacy: { key: string; amount: number; dayOfMonth: number }[]
) {
  for (const row of legacy) {
    const id = legacyKeyToItemId(row.key);
    if (!id || row.amount <= 0) continue;
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, {
        id,
        amount: row.amount,
        dayOfMonth: row.dayOfMonth,
        enabled: true,
      });
    }
  }
}

/** True when DB still uses legacy recurringExpenses / empty fixedItems */
export function planNeedsLegacyMigration(plan: PlanShapeInput): boolean {
  const hasLegacy =
    (plan.recurringExpenses?.length ?? 0) > 0 ||
    (plan.allocations?.length ?? 0) > 0;
  const fixedEmpty =
    !plan.fixedItems?.length ||
    plan.fixedItems.every((f) => !f.amount);
  return hasLegacy && fixedEmpty;
}

/** Legacy rows left in DB after fixedItems were saved — they must be cleared */
export function planHasStaleLegacy(plan: PlanShapeInput): boolean {
  const hasLegacy =
    (plan.recurringExpenses?.length ?? 0) > 0 ||
    (plan.allocations?.length ?? 0) > 0;
  const hasFixed =
    (plan.fixedItems?.length ?? 0) > 0 &&
    (plan.fixedItems?.some((f) => f.amount > 0) ?? false);
  return hasLegacy && hasFixed;
}

/** Client-safe: fills missing fields from old DB documents */
export function normalizePlanShape(plan: PlanShapeInput) {
  const defaultItems = buildDefaultFixedItems();
  const byId = new Map<string, PlanFixedItem>(
    (plan.fixedItems ?? []).map((f) => [f.id, f])
  );

  const useLegacy = planNeedsLegacyMigration(plan);

  if (useLegacy) {
    mergeLegacyIntoItems(
      byId,
      (plan.recurringExpenses ?? []).map((r) => ({
        key: r.title,
        amount: r.amount,
        dayOfMonth: r.dayOfMonth,
      }))
    );

    mergeLegacyIntoItems(
      byId,
      (plan.allocations ?? [])
        .filter((a) => a.category !== "savings" && a.label !== "emergency_fund")
        .map((a) => ({
          key: a.label,
          amount: a.amount,
          dayOfMonth:
            getItemDefinition(legacyKeyToItemId(a.label) ?? "")?.defaultDay ?? 1,
        }))
    );
  }

  let emergencyFromAlloc: LegacyAllocation | undefined;
  if (useLegacy) {
    emergencyFromAlloc = (plan.allocations ?? []).find(
      (a) =>
        a.label === "emergency_fund" ||
        a.label === "emergency_savings" ||
        a.category === "savings"
    );
  }

  const fixedItems = defaultItems.map((def) => {
    const existing = byId.get(def.id);
    return existing
      ? {
          ...def,
          ...existing,
          enabled: existing.enabled ?? true,
        }
      : { ...def };
  });

  const emergencyFund: EmergencyFundSettings = {
    ...buildDefaultEmergencyFund(),
    ...(plan.emergencyFund ?? {}),
  };

  if (
    emergencyFromAlloc &&
    emergencyFromAlloc.amount > 0 &&
    !emergencyFund.monthlyDeposit
  ) {
    emergencyFund.monthlyDeposit = emergencyFromAlloc.amount;
    emergencyFund.enabled = true;
  }

  return {
    isActive: plan.isActive ?? true,
    salaryAmount: plan.salaryAmount ?? 0,
    currency: plan.currency ?? "EUR",
    fixedItems,
    emergencyFund,
    lastExecutedMonth: plan.lastExecutedMonth,
  };
}

export function planTotalCents(plan: PlanShapeInput): number {
  const normalized = normalizePlanShape(plan);
  const items = normalized.fixedItems
    .filter((f) => f.enabled && f.amount > 0)
    .reduce((s, f) => s + f.amount, 0);
  const emergency =
    normalized.emergencyFund.enabled &&
    normalized.emergencyFund.monthlyDeposit > 0
      ? normalized.emergencyFund.monthlyDeposit
      : 0;
  return items + emergency;
}
