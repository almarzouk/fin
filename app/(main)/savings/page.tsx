"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SavingsGoalCard } from "@/components/savings/SavingsGoalCard";
import { AddGoalDialog } from "@/components/savings/AddGoalDialog";
import { useFetch } from "@/hooks/useFetch";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { SavingsGoalDTO } from "@/types";
import { PiggyBank, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function SavingsPage() {
  const { t, locale } = useLocale();
  const s = t.savings;
  const [addOpen, setAddOpen] = useState(false);
  const [rev, setRev]         = useState(0);

  const { data: goals, loading } = useFetch<SavingsGoalDTO[]>(
    `/api/savings-goals?_r=${rev}`
  );

  const refresh = useCallback(() => setRev((r) => r + 1), []);

  const totalBalance = (goals ?? []).reduce((sum, g) => sum + g.currentBalance, 0);
  const totalTarget  = (goals ?? []).reduce((sum, g) => sum + g.targetAmount,   0);
  const currency     = goals?.[0]?.currency ?? "EUR";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <PiggyBank className="size-6 text-amber-500" />
            {s.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{s.subtitle}</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="size-4" /> {s.newGoal}
        </Button>
      </div>

      {/* Summary bar */}
      {!loading && (goals?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">{s.totalSaved}</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalBalance, currency, locale)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{s.totalTarget}</p>
            <p className="text-xl font-bold">{formatCurrency(totalTarget, currency, locale)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground mb-1.5">{s.overallProgress}</p>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-700"
                style={{ width: `${totalTarget > 0 ? Math.min(100, Math.round((totalBalance / totalTarget) * 100)) : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Goals grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : !goals?.length ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
          <PiggyBank className="size-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium">{s.noGoals}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.noGoalsHint}</p>
          </div>
          <Button onClick={() => setAddOpen(true)} variant="outline" className="gap-2">
            <Plus className="size-4" /> {s.newGoal}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <SavingsGoalCard key={goal._id} goal={goal} onUpdate={refresh} />
          ))}
        </div>
      )}

      <AddGoalDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={refresh}
      />
    </div>
  );
}
