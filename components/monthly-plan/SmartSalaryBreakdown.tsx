"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency } from "@/lib/utils";
import { computeSalaryBreakdown, SLICE_COLORS } from "@/lib/salary-breakdown";
import type { PlanShapeInput } from "@/lib/monthly-plan-items";
import { labelForPlanItem } from "@/lib/preset-labels";
import { cn } from "@/lib/utils";

interface SmartSalaryBreakdownProps {
  plan: PlanShapeInput;
}

export function SmartSalaryBreakdown({ plan }: SmartSalaryBreakdownProps) {
  const { t, locale } = useLocale();
  const { salary, committed, remaining, slices, isOverBudget } =
    computeSalaryBreakdown(plan);

  const sliceLabel = (id: string, kind: string) => {
    if (id === "emergency_fund") return t.monthlyPlan.items.emergency_fund;
    if (id === "free_spending") return t.monthlyPlan.freeSpending;
    return labelForPlanItem(t, id);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{t.monthlyPlan.smartSplit}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {salary <= 0 ? (
          <p className="text-sm text-muted-foreground">{t.monthlyPlan.enterSalaryFirst}</p>
        ) : (
          <>
            <section className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
              {slices.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    SLICE_COLORS[s.kind],
                    "transition-all min-w-[2px]"
                  )}
                  style={{ width: `${Math.max(s.percent, 0.5)}%` }}
                  title={`${sliceLabel(s.id, s.kind)}: ${s.percent}%`}
                />
              ))}
              {isOverBudget && (
                <div
                  className="bg-red-500 min-w-[4px]"
                  style={{
                    width: `${Math.min(100, (Math.abs(remaining) / salary) * 100)}%`,
                  }}
                />
              )}
            </section>

            <ul className="space-y-2">
              {slices.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        SLICE_COLORS[s.kind]
                      )}
                    />
                    <span className="truncate">{sliceLabel(s.id, s.kind)}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {s.percent}%
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatCurrency(s.amount, "EUR", locale)}
                  </span>
                </li>
              ))}
            </ul>

            <section className="grid gap-3 sm:grid-cols-3 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">{t.monthlyPlan.salary}</p>
                <p className="text-lg font-bold">
                  {formatCurrency(salary, "EUR", locale)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.monthlyPlan.totalPlanned}</p>
                <p className="text-lg font-bold">
                  {formatCurrency(committed, "EUR", locale)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.monthlyPlan.remaining}</p>
                <p
                  className={cn(
                    "text-lg font-bold",
                    isOverBudget ? "text-red-600" : "text-green-600"
                  )}
                >
                  {formatCurrency(remaining, "EUR", locale)}
                </p>
              </div>
            </section>

            {isOverBudget && (
              <Badge variant="destructive" className="w-full justify-center py-2">
                {t.monthlyPlan.overBudget}
              </Badge>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
