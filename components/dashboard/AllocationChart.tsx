"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

interface AllocationChartProps {
  allocations: { label: string; amount: number }[];
  currency: string;
  loading?: boolean;
}

export function AllocationChart({
  allocations,
  currency,
  loading,
}: AllocationChartProps) {
  const { t, locale } = useLocale();

  if (loading) {
    return (
      <Card className="card-glow">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!allocations.length) {
    return (
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>{t.dashboard.allocationBreakdown}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            {t.common.empty}
          </p>
        </CardContent>
      </Card>
    );
  }

  const data = allocations.map((a) => ({
    name: a.label,
    value: a.amount / 100,
    raw: a.amount,
  }));

  const total = allocations.reduce((s, a) => s + a.amount, 0);

  return (
    <Card className="card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t.dashboard.allocationBreakdown}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) =>
                    formatCurrency(Math.round(Number(v) * 100), currency, locale)
                  }
                  contentStyle={{
                    borderRadius: "0.625rem",
                    fontSize: "12px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-muted-foreground">Total</span>
              <span className="text-sm font-bold leading-tight">
                {formatCurrency(total, currency, locale)}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            {data.map((entry, i) => {
              const pct = total > 0 ? Math.round((entry.raw / total) * 100) : 0;
              return (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground truncate flex-1">{entry.name}</span>
                  <span className="text-xs font-mono font-medium tabular-nums shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
