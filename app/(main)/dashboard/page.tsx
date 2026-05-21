"use client";

import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { AllocationChart, ExpenseTrend } from "@/components/dashboard/charts-lazy";
import { useFetch } from "@/hooks/useFetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency } from "@/lib/utils";
import { labelForExpense } from "@/lib/preset-labels";
import type { DashboardStats, ExpenseDTO } from "@/types";
import { Bell, ReceiptText, CalendarDays } from "lucide-react";

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

  const now = new Date();
  const monthLabel = now.toLocaleDateString(locale === "ar" ? "ar-SA" : "de-DE", {
    month: "long",
    year: "numeric",
  });
  const hour = now.getHours();
  const greeting =
    hour < 12 ? (locale === "ar" ? "صباح الخير" : "Guten Morgen") :
    hour < 17 ? (locale === "ar" ? "مساء النهار" : "Guten Tag") :
                (locale === "ar" ? "مساء الخير" : "Guten Abend");

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-0.5">{greeting} 👋</p>
          <h2 className="text-2xl font-bold tracking-tight">{t.nav.dashboard}</h2>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl">
          <CalendarDays className="size-3.5" />
          {monthLabel}
        </Badge>
      </div>

      <SummaryCards stats={stats} loading={loading} />

      {/* Health Score + Allocation Chart */}
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

      {/* Expense Trend */}
      <ExpenseTrend
        data={stats?.monthlyTrend ?? []}
        currency={currency}
        loading={loading}
      />

      {/* Recent Expenses + Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 card-glow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ReceiptText className="size-4 text-primary" />
              {t.dashboard.recentExpenses}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : !stats?.recentExpenses?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{t.dashboard.noExpenses}</p>
            ) : (
              <ul className="divide-y divide-border">
                {(stats.recentExpenses as ExpenseDTO[]).map((e) => (
                  <li
                    key={e._id}
                    className="flex justify-between items-center py-2.5 text-sm"
                  >
                    <span className="text-foreground/80">{labelForExpense(t, e.title)}</span>
                    <span className="font-mono font-medium text-destructive">
                      -{formatCurrency(e.amount, currency, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="size-4 text-amber-500" />
              {t.dashboard.alerts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !stats?.unreadAlerts?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{t.dashboard.noAlerts}</p>
            ) : (
              <ul className="space-y-3">
                {stats.unreadAlerts.map((a) => (
                  <li key={a._id} className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{a.message}</p>
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
