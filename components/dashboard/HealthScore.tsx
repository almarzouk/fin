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

function CircleScore({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#22c55e" :
    score >= 60 ? "#6366f1" :
    score >= 40 ? "#f59e0b" :
                  "#ef4444";
  const textColor =
    score >= 80 ? "text-emerald-500" :
    score >= 60 ? "text-indigo-500" :
    score >= 40 ? "text-amber-500" :
                  "text-red-500";

  return (
    <div className="relative flex items-center justify-center size-24 shrink-0">
      <svg className="size-24 -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={radius} fill="none" strokeWidth="7" className="stroke-muted" />
        <circle
          cx="44" cy="44" r={radius} fill="none" strokeWidth="7"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-extrabold tabular-nums leading-none", textColor)}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function MiniBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", colorClass)} style={{ width: `${pct}%` }} />
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
      <Card className="card-glow">
        <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </CardContent>
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
    { icon: TrendingUp,  label: hs.investment,    value: score.breakdown.investment,    max: 25, colorClass: "bg-indigo-500"  },
    { icon: Shield,      label: hs.emergencyFund,  value: score.breakdown.emergencyFund, max: 30, colorClass: "bg-amber-500"   },
    { icon: PiggyBank,   label: hs.savings,        value: score.breakdown.savings,       max: 25, colorClass: "bg-emerald-500" },
    { icon: ShoppingBag, label: hs.spending,       value: score.breakdown.spending,      max: 20, colorClass: "bg-sky-500"     },
  ];

  return (
    <Card className="card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{hs.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-5">
          <CircleScore score={score.total} />
          <div className="flex-1 space-y-2.5">
            <div>
              <p className="text-lg font-bold leading-tight">{label}</p>
              <p className="text-xs text-muted-foreground">{hs.outOf100}</p>
            </div>
            <div className="space-y-2">
              {rows.map(({ icon: Icon, label: rowLabel, value, max, colorClass }) => (
                <div key={rowLabel} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Icon className="size-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{rowLabel}</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">{value}/{max}</span>
                  </div>
                  <MiniBar value={value} max={max} colorClass={colorClass} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {score.tips.length > 0 && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 space-y-1.5">
            {score.tips.slice(0, 2).map((tip) => {
              const key = TIP_KEYS[tip];
              if (!key) return null;
              const parts = key.split(".");
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const section = (t.dashboard as any)[parts[0]] as Record<string, string> | undefined;
              const msg = section?.[parts[1]];
              return msg ? (
                <p key={tip} className="text-xs text-muted-foreground leading-relaxed">
                  💡 {msg}
                </p>
              ) : null;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
