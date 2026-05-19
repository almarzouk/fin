"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { FinancialHealthScore } from "@/types";
import { cn } from "@/lib/utils";
import { TrendingUp, Shield, PiggyBank, ShoppingBag } from "lucide-react";

interface HealthScoreProps {
  score: FinancialHealthScore | undefined;
  loading?: boolean;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-green-600 bg-green-500/10 border-green-500/30" :
    score >= 60 ? "text-blue-600 bg-blue-500/10 border-blue-500/30" :
    score >= 40 ? "text-amber-600 bg-amber-500/10 border-amber-500/30" :
                  "text-red-600 bg-red-500/10 border-red-500/30";
  return (
    <div className={cn("flex items-center justify-center size-16 rounded-full border-2 text-2xl font-extrabold shrink-0", color)}>
      {score}
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono w-8 text-end">{value}/{max}</span>
    </div>
  );
}

const TIP_KEYS: Record<string, string> = {
  invest_more:            "healthTips.investMore",
  invest_excellent:       "healthTips.investExcellent",
  build_emergency_fund:   "healthTips.buildEmergencyFund",
  emergency_fund_complete:"healthTips.emergencyFundComplete",
  start_saving:           "healthTips.startSaving",
  reduce_unnecessary:     "healthTips.reduceUnnecessary",
  spending_great:         "healthTips.spendingGreat",
};

export function HealthScore({ score, loading }: HealthScoreProps) {
  const { t } = useLocale();
  const hs = t.dashboard.healthScore;

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
      </Card>
    );
  }

  if (!score) return null;

  const label =
    score.total >= 80 ? hs.excellent :
    score.total >= 60 ? hs.good :
    score.total >= 40 ? hs.fair :
                        hs.needsWork;

  const rows = [
    { icon: TrendingUp,   label: hs.investment,   value: score.breakdown.investment,   max: 25, color: "bg-violet-500" },
    { icon: Shield,       label: hs.emergencyFund, value: score.breakdown.emergencyFund,max: 30, color: "bg-amber-500"  },
    { icon: PiggyBank,    label: hs.savings,       value: score.breakdown.savings,      max: 25, color: "bg-green-500"  },
    { icon: ShoppingBag,  label: hs.spending,      value: score.breakdown.spending,     max: 20, color: "bg-blue-500"   },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{hs.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <ScoreBadge score={score.total} />
          <div>
            <p className="text-lg font-bold">{label}</p>
            <p className="text-xs text-muted-foreground">{hs.outOf100}</p>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map(({ icon: Icon, label: rowLabel, value, max, color }) => (
            <div key={rowLabel}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="size-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{rowLabel}</span>
              </div>
              <MiniBar value={value} max={max} color={color} />
            </div>
          ))}
        </div>

        {score.tips.length > 0 && (
          <div className="rounded-lg bg-muted/40 p-3 space-y-1.5">
            {score.tips.slice(0, 2).map((tip) => {
              const key = TIP_KEYS[tip];
              if (!key) return null;
              const parts = key.split(".");
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const section = (t.dashboard as any)[parts[0]] as Record<string, string> | undefined;
              const msg = section?.[parts[1]];
              return msg ? (
                <p key={tip} className="text-xs text-muted-foreground leading-relaxed">
                  • {msg}
                </p>
              ) : null;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
