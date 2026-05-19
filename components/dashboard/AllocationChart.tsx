"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

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
      <Card>
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
      <Card>
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
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.dashboard.allocationBreakdown}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) =>
                formatCurrency(Math.round(Number(v) * 100), currency, locale)
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
