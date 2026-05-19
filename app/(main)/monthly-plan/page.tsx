"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ManualAmountInput } from "@/components/shared/ManualAmountInput";
import { DaySelect } from "@/components/shared/DaySelect";
import {
  formatCurrency,
  getCurrentMonth,
  fromCents,
  toCents,
  parseDisplayAmount,
} from "@/lib/utils";
import { invalidateFetchCache } from "@/hooks/useFetch";
import { labelForPlanItem } from "@/lib/preset-labels";
import {
  normalizePlanShape,
  planTotalCents,
  type PlanFixedItem,
  type EmergencyFundSettings,
} from "@/lib/monthly-plan-items";
import { cn } from "@/lib/utils";
import { SmartSalaryBreakdown } from "@/components/monthly-plan/SmartSalaryBreakdown";

interface PlanData {
  isActive: boolean;
  salaryAmount: number;
  currency: string;
  fixedItems: PlanFixedItem[];
  emergencyFund: EmergencyFundSettings;
  lastExecutedMonth?: string;
}

export default function MonthlyPlanPage() {
  const { t, locale } = useLocale();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const res = await fetch("/api/monthly-plan", { cache: "no-store" });
    if (res.ok) {
      const raw = await res.json();
      setPlan(normalizePlanShape(raw));
    }
    if (!opts?.silent) setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persistPlan = async (data: PlanData): Promise<boolean> => {
    try {
      const res = await fetch("/api/monthly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        cache: "no-store",
      });
      if (!res.ok) {
        setMessage(t.monthlyPlan.saveFailed);
        return false;
      }
      setPlan(normalizePlanShape(await res.json()));
      return true;
    } catch {
      setMessage(t.monthlyPlan.saveFailed);
      return false;
    }
  };

  const save = async () => {
    if (!plan) return;
    setSaving(true);
    setMessage("");
    const ok = await persistPlan(plan);
    if (ok) setMessage(t.monthlyPlan.saved);
    setSaving(false);
  };

  const execute = async () => {
    if (!plan) return;
    setExecuting(true);
    setMessage("");
    const saved = await persistPlan(plan);
    if (!saved) {
      setExecuting(false);
      return;
    }
    const res = await fetch("/api/monthly-plan/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    setExecuting(false);
    invalidateFetchCache();
    if (data.executed) setMessage(t.monthlyPlan.executed);
    else if (data.message === "already_executed")
      setMessage(t.monthlyPlan.alreadyDone);
    load({ silent: true });
  };

  if (loading || !plan) {
    return <p className="text-muted-foreground">{t.common.loading}</p>;
  }

  const totalPlanned = planTotalCents(plan);
  const remaining = plan.salaryAmount - totalPlanned;

  const updateItem = (index: number, patch: Partial<PlanFixedItem>) => {
    const fixedItems = [...(plan.fixedItems ?? [])];
    fixedItems[index] = { ...fixedItems[index], ...patch };
    setPlan({ ...plan, fixedItems });
  };

  return (
    <section className="space-y-6 max-w-2xl">
      <header>
        <h2 className="text-2xl font-bold">{t.monthlyPlan.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.monthlyPlan.subtitle}</p>
      </header>

      {message && (
        <p
          className={cn(
            "text-sm font-medium",
            message === t.monthlyPlan.saveFailed
              ? "text-red-600"
              : "text-green-600"
          )}
        >
          {message}
        </p>
      )}

      <SmartSalaryBreakdown plan={plan} />

      <Card>
        <CardHeader>
          <CardTitle>{t.monthlyPlan.salary}</CardTitle>
          <CardDescription>{t.monthlyPlan.salaryHint}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset className="space-y-2 border-0 p-0">
            <Label>{t.monthlyPlan.salary} (€)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={plan.salaryAmount === 0 ? "" : fromCents(plan.salaryAmount)}
              onChange={(e) =>
                setPlan({
                  ...plan,
                  salaryAmount: toCents(parseDisplayAmount(e.target.value || "0")),
                })
              }
            />
          </fieldset>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={plan.isActive}
              onChange={(e) => setPlan({ ...plan, isActive: e.target.checked })}
            />
            {t.monthlyPlan.active}
          </label>
          {plan.lastExecutedMonth && (
            <p className="text-xs text-muted-foreground">
              {t.monthlyPlan.lastRun}: {plan.lastExecutedMonth}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-amber-600" />
            <CardTitle>{t.monthlyPlan.emergencyFund}</CardTitle>
          </div>
          <CardDescription>{t.monthlyPlan.emergencyHint}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-background/80 p-4 border">
            <span className="text-sm text-muted-foreground">
              {t.monthlyPlan.emergencyBalance}
            </span>
            <span className="text-xl font-bold text-amber-700">
              {formatCurrency(plan.emergencyFund.balance, plan.currency, locale)}
            </span>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={plan.emergencyFund.enabled}
              onChange={(e) =>
                setPlan({
                  ...plan,
                  emergencyFund: {
                    ...plan.emergencyFund,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            {t.monthlyPlan.active}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <ManualAmountInput
              label={t.monthlyPlan.emergencyDeposit}
              valueCents={plan.emergencyFund.monthlyDeposit}
              onChange={(monthlyDeposit) =>
                setPlan({
                  ...plan,
                  emergencyFund: { ...plan.emergencyFund, monthlyDeposit },
                })
              }
            />
            <DaySelect
              label={t.monthlyPlan.dayOfMonth}
              value={plan.emergencyFund.dayOfMonth}
              onChange={(dayOfMonth) =>
                setPlan({
                  ...plan,
                  emergencyFund: { ...plan.emergencyFund, dayOfMonth },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.monthlyPlan.fixedItems}</CardTitle>
          <CardDescription>{getCurrentMonth()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(plan.fixedItems ?? []).map((item, i) => (
            <section
              key={item.id}
              className={cn(
                "rounded-xl border p-4 space-y-3",
                !item.enabled && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{labelForPlanItem(t, item.id)}</p>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) =>
                      updateItem(i, { enabled: e.target.checked })
                    }
                  />
                  {t.monthlyPlan.active}
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ManualAmountInput
                  label={t.monthlyPlan.amountEur}
                  valueCents={item.amount}
                  onChange={(amount) => updateItem(i, { amount })}
                />
                <DaySelect
                  label={t.monthlyPlan.dayOfMonth}
                  value={item.dayOfMonth}
                  onChange={(dayOfMonth) => updateItem(i, { dayOfMonth })}
                />
              </div>
            </section>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.monthlyPlan.totalPlanned}</span>
            <span className="font-semibold">
              {formatCurrency(totalPlanned, plan.currency, locale)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.monthlyPlan.remaining}</span>
            <span
              className={cn(
                "font-bold text-lg",
                remaining >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {formatCurrency(remaining, plan.currency, locale)}
            </span>
          </div>
          {remaining < 0 && (
            <Badge variant="destructive" className="mt-2">
              {t.expenses.warningBanner}
            </Badge>
          )}
        </CardContent>
      </Card>

      <section className="flex flex-wrap gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? t.common.loading : t.monthlyPlan.save}
        </Button>
        <Button onClick={execute} disabled={executing}>
          <Play className="me-1 size-4" />
          {executing ? t.common.loading : t.monthlyPlan.executeNow}
        </Button>
      </section>
    </section>
  );
}