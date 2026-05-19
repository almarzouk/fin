"use client";

import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { AllocationChart, ExpenseTrend } from "@/components/dashboard/charts-lazy";
import { useFetch } from "@/hooks/useFetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency } from "@/lib/utils";
import { labelForExpense } from "@/lib/preset-labels";
import type { DashboardStats, ExpenseDTO } from "@/types";

export default function DashboardPage() {
  const { t, locale } = useLocale();
  const { data: stats, loading: dashLoading } = useFetch<DashboardStats>(
    "/api/dashboard"
  );
  const { data: salary, loading: salLoading } = useFetch<{
    allocations: { label: string; amount: number }[];
  } | null>("/api/salary");
  const loading = dashLoading || salLoading;
  const salaryAllocations = salary?.allocations ?? [];
  const currency = stats?.currency ?? "EUR";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t.nav.dashboard}</h2>
      <SummaryCards stats={stats} loading={loading} />

      {/* Health Score + Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <HealthScore score={stats?.healthScore} loading={loading} />
        <div className="lg:col-span-2">
          <AllocationChart
            allocations={salaryAllocations}
            currency={currency}
            loading={loading}
          />
        </div>
      </div>

      <ExpenseTrend
        data={stats?.monthlyTrend ?? []}
        currency={currency}
        loading={loading}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.dashboard.recentExpenses}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : !stats?.recentExpenses?.length ? (
              <p className="text-sm text-muted-foreground">{t.dashboard.noExpenses}</p>
            ) : (
              <ul className="space-y-2">
                {(stats.recentExpenses as ExpenseDTO[]).map((e) => (
                  <li
                    key={e._id}
                    className="flex justify-between text-sm border-b border-border pb-2"
                  >
                    <span>{labelForExpense(t, e.title)}</span>
                    <span className="font-mono">
                      {formatCurrency(e.amount, currency, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.alerts}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : !stats?.unreadAlerts?.length ? (
              <p className="text-sm text-muted-foreground">{t.dashboard.noAlerts}</p>
            ) : (
              <ul className="space-y-3">
                {stats.unreadAlerts.map((a) => (
                  <li key={a._id} className="text-sm">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-muted-foreground text-xs">{a.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
