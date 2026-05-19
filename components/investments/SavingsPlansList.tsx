"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency } from "@/lib/utils";
import { labelForInvestment } from "@/lib/preset-labels";
import { cn } from "@/lib/utils";

interface SavingsPlanRow {
  _id: string;
  assetId: string;
  title: string;
  monthlyAmount: number;
  dayOfMonth: number;
  daysUntil: number;
}

export function SavingsPlansList() {
  const { t, locale } = useLocale();
  const [plans, setPlans] = useState<SavingsPlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/savings-plans");
    if (res.ok) setPlans(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t.common.loading}</p>;
  }

  if (!plans.length) {
    return (
      <p className="text-sm text-muted-foreground py-4">{t.common.empty}</p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.investments.savingsPlans}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-0">
        <ul className="divide-y divide-border">
          {plans.map((plan) => (
            <li
              key={plan._id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50"
            >
              <DaysRing days={plan.daysUntil} label={t.investments.daysLeft} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {labelForInvestment(t, plan.title)}
                </p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {t.investments.monthly}
                </Badge>
              </div>
              <p className="font-semibold tabular-nums shrink-0">
                {formatCurrency(plan.monthlyAmount, "EUR", locale)}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DaysRing({ days, label }: { days: number; label: string }) {
  const progress = Math.max(0, Math.min(100, ((28 - days) / 28) * 100));
  return (
    <div
      className="relative size-12 shrink-0 flex items-center justify-center"
      title={`${days} ${label}`}
    >
      <svg className="size-12 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          className="stroke-muted"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          className="stroke-blue-500"
          strokeWidth="3"
          strokeDasharray={`${progress} ${100 - progress}`}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("absolute text-[10px] font-bold text-center leading-tight")}>
        {days}
        <br />
        <span className="font-normal text-[8px]">{label}</span>
      </span>
    </div>
  );
}
