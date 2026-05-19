"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { TrendingDown, TrendingUp, Wallet, PiggyBank } from "lucide-react";

interface SummaryCardsProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

export function SummaryCards({ stats, loading }: SummaryCardsProps) {
  const { t, locale } = useLocale();
  const currency = stats?.currency ?? "EUR";

  const cards = [
    {
      title: t.dashboard.monthlySalary,
      value: stats?.totalSalary ?? 0,
      icon: Wallet,
      className: "border-green-500/30 bg-green-500/5",
      iconClass: "text-green-600",
    },
    {
      title: t.dashboard.totalExpenses,
      value: stats?.totalExpenses ?? 0,
      icon: TrendingDown,
      className: "border-red-500/30 bg-red-500/5",
      iconClass: "text-red-600",
    },
    {
      title: t.dashboard.totalInvested,
      value: stats?.totalInvested ?? 0,
      icon: PiggyBank,
      className: "border-blue-500/30 bg-blue-500/5",
      iconClass: "text-blue-600",
    },
    {
      title: t.dashboard.remainingBalance,
      value: stats?.remainingBalance ?? 0,
      icon: TrendingUp,
      className: cn(
        (stats?.remainingBalance ?? 0) >= 0
          ? "border-green-500/30 bg-green-500/5"
          : "border-red-500/30 bg-red-500/5"
      ),
      iconClass:
        (stats?.remainingBalance ?? 0) >= 0 ? "text-green-600" : "text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ title, value, icon: Icon, className, iconClass }) => (
        <Card key={title} className={className}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className={cn("size-4", iconClass)} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(value, currency, locale)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
