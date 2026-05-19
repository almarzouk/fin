"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/components/providers/LocaleProvider";
import { SmartSalaryBreakdown } from "@/components/monthly-plan/SmartSalaryBreakdown";
import { normalizePlanShape, type EmergencyFundSettings, type PlanFixedItem } from "@/lib/monthly-plan-items";
import { formatCurrency } from "@/lib/utils";
import { Shield } from "lucide-react";

interface PlanData {
  isActive: boolean;
  salaryAmount: number;
  currency: string;
  fixedItems: PlanFixedItem[];
  emergencyFund: EmergencyFundSettings;
}

export default function SalaryPage() {
  const { t, locale } = useLocale();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/monthly-plan");
    if (res.ok) {
      const raw = await res.json();
      setPlan(normalizePlanShape(raw));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !plan) {
    return <p className="text-muted-foreground">{t.common.loading}</p>;
  }

  return (
    <section className="space-y-6 max-w-2xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.salary.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t.salary.subtitle}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/monthly-plan">
            <CalendarClock className="me-2 size-4" />
            {t.salary.editPlan}
          </Link>
        </Button>
      </header>

      <SmartSalaryBreakdown plan={plan} />

      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-amber-600" />
            <CardTitle>{t.monthlyPlan.emergencyFund}</CardTitle>
          </div>
          <CardDescription>{t.monthlyPlan.emergencyHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.monthlyPlan.emergencyBalance}</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {formatCurrency(plan.emergencyFund.balance, plan.currency, locale)}
          </p>
          {plan.emergencyFund.monthlyDeposit > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              +{formatCurrency(plan.emergencyFund.monthlyDeposit, plan.currency, locale)}{" "}
              {t.monthlyPlan.emergencyDeposit}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
