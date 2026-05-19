"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency, calculateProfit } from "@/lib/utils";
import { labelForInvestment } from "@/lib/preset-labels";
import { invalidateFetchCache } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import type { InvestmentDTO } from "@/types";

interface InvestmentExt extends InvestmentDTO {
  ticker?: string;
  shares?: number;
  priceEur?: number;
  lastPriceUpdate?: string;
  assetId?: string;
}

export function PortfolioPanel({
  onRefresh,
}: {
  onRefresh?: () => void;
}) {
  const { t, locale } = useLocale();
  const [items, setItems] = useState<InvestmentExt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/investments");
    if (res.ok) {
      const data = await res.json();
      setItems(
        data.filter((i: InvestmentExt) => i.ticker || i.assetId)
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refreshPrices = async () => {
    setRefreshing(true);
    await fetch("/api/stocks/refresh", { method: "POST" });
    invalidateFetchCache();
    await load();
    onRefresh?.();
    setRefreshing(false);
  };

  const importPortfolio = async () => {
    setLoading(true);
    await fetch("/api/portfolio/import", { method: "POST" });
    invalidateFetchCache();
    await load();
    onRefresh?.();
  };

  const totalValue = items.reduce((s, i) => s + i.currentValue, 0);

  if (loading) {
    return <p className="text-muted-foreground">{t.common.loading}</p>;
  }

  return (
    <section className="space-y-4">
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t.investments.totalValue}</p>
            <p className="text-3xl font-bold">
              {formatCurrency(totalValue, "EUR", locale)}
            </p>
          </div>
          <section className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              onClick={refreshPrices}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn("me-2 size-4", refreshing && "animate-spin")}
              />
              {refreshing ? t.investments.refreshing : t.investments.refreshPrices}
            </Button>
            {items.length === 0 && (
              <Button variant="outline" onClick={importPortfolio}>
                {t.investments.importPortfolio}
              </Button>
            )}
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.investments.portfolio}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">{t.investments.noData}</p>
          ) : (
            <ul className="divide-y divide-border">
              {items
                .sort((a, b) => b.currentValue - a.currentValue)
                .map((inv) => {
                  const { profit } = calculateProfit(inv.amount, inv.currentValue);
                  const isUp = profit >= 0;
                  return (
                    <li
                      key={inv._id}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {labelForInvestment(t, inv.title)}
                        </p>
                        {inv.shares != null && inv.shares > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {inv.shares.toFixed(4)} {t.investments.shares}
                            {inv.ticker && ` · ${inv.ticker}`}
                          </p>
                        )}
                      </div>
                      <div className="text-end shrink-0">
                        <p className="font-semibold tabular-nums">
                          {formatCurrency(inv.currentValue, "EUR", locale)}
                        </p>
                        <p
                          className={cn(
                            "text-sm tabular-nums",
                            isUp ? "text-green-600" : "text-red-600"
                          )}
                        >
                          {isUp ? "▲" : "▼"}{" "}
                          {formatCurrency(Math.abs(profit), "EUR", locale)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {t.investments.sinceBuy}
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
