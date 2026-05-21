"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { TrendingDown, TrendingUp, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryCardsProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

export function SummaryCards({ stats, loading }: SummaryCardsProps) {
  const { t, locale } = useLocale();
  const currency = stats?.currency ?? "EUR";
  const balance = stats?.remainingBalance ?? 0;
  const balancePositive = balance >= 0;

  const cards = [
    {
      title: t.dashboard.monthlySalary,
      value: stats?.totalSalary ?? 0,
      icon: Wallet,
      gradient: "gradient-green",
      iconClass: "stat-icon-green",
      trend: null,
      sub: null,
    },
    {
      title: t.dashboard.totalExpenses,
      value: stats?.totalExpenses ?? 0,
      icon: TrendingDown,
      gradient: "gradient-red",
      iconClass: "stat-icon-red",
      trend: stats?.totalSalary
        ? Math.round((stats.totalExpenses / stats.totalSalary) * 100)
        : null,
      trendLabel: "من الراتب",
      trendDown: true,
      sub: stats?.unnecessaryExpensesTotal
        ? `${formatCurrency(stats.unnecessaryExpensesTotal, currency, locale)} غير ضروري`
        : null,
    },
    {
      title: t.dashboard.totalInvested,
      value: stats?.totalInvested ?? 0,
      icon: PiggyBank,
      gradient: "gradient-violet",
      iconClass: "stat-icon-violet",
      trend: stats?.totalSalary
        ? Math.round((stats.totalInvested / stats.totalSalary) * 100)
        : null,
      trendLabel: "من الراتب",
      trendDown: false,
      sub: null,
    },
    {
      title: t.dashboard.remainingBalance,
      value: balance,
      icon: balancePositive ? TrendingUp : TrendingDown,
      gradient: balancePositive ? "gradient-blue" : "gradient-red",
      iconClass: balancePositive ? "stat-icon-blue" : "stat-icon-red",
      trend: null,
      sub: null,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border">
            <CardContent className="pt-6 pb-5 px-5">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ title, value, icon: Icon, gradient, iconClass, trend, trendLabel, trendDown, sub }) => (
        <Card key={title} className={cn("border card-glow overflow-hidden", gradient)}>
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground leading-tight">{title}</p>
              <span className={cn("flex items-center justify-center size-9 rounded-xl shrink-0", iconClass)}>
                <Icon className="size-4" />
              </span>
            </div>
            <p className={cn(
              "text-2xl font-bold tracking-tight tabular-nums",
              value < 0 ? "text-destructive" : ""
            )}>
              {formatCurrency(value, currency, locale)}
            </p>
            {trend !== null && (
              <div className="flex items-center gap-1 mt-1.5">
                {trendDown
                  ? <ArrowUpRight className="size-3 text-destructive" />
                  : <ArrowUpRight className="size-3 text-emerald-500" />
                }
                <span className={cn(
                  "text-xs font-medium",
                  trendDown ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {trend}% {trendLabel}
                </span>
              </div>
            )}
            {sub && (
              <p className="text-xs text-muted-foreground mt-1.5 truncate">{sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
