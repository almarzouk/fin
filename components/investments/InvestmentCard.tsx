"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocale } from "@/components/providers/LocaleProvider";
import { AmountSelect } from "@/components/shared/AmountSelect";
import { formatCurrency, calculateProfit } from "@/lib/utils";
import { labelForInvestment } from "@/lib/preset-labels";
import { cn } from "@/lib/utils";
import type { InvestmentDTO } from "@/types";

interface InvestmentCardProps {
  investment: InvestmentDTO;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

export function InvestmentCard({
  investment,
  onUpdate,
  onDelete,
}: InvestmentCardProps) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [valueCents, setValueCents] = useState(investment.currentValue);
  const [saving, setSaving] = useState(false);

  const { profit, percentage } = calculateProfit(
    investment.amount,
    investment.currentValue
  );
  const isProfit = profit >= 0;

  const saveValue = async () => {
    setSaving(true);
    try {
      await fetch(`/api/investments/${investment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue: valueCents }),
      });
      setOpen(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle className="text-base">
            {labelForInvestment(t, investment.title)}
          </CardTitle>
          <span className="text-xs text-muted-foreground">{investment.type}</span>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.investments.invested}</span>
            <span>{formatCurrency(investment.amount, "EUR", locale)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t.investments.currentValue}</span>
            <span>{formatCurrency(investment.currentValue, "EUR", locale)}</span>
          </div>
          <div
            className={cn(
              "rounded-lg p-2 text-sm font-medium",
              isProfit ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
            )}
          >
            {isProfit ? t.investments.profit : t.investments.loss}:{" "}
            {formatCurrency(Math.abs(profit), "EUR", locale)} ({percentage.toFixed(1)}%)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <Pencil className="size-3 me-1" />
              {t.investments.editValue}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(investment._id)}>
              <Trash2 className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.investments.editValue}</DialogTitle>
          </DialogHeader>
          <AmountSelect
            label={t.investments.currentValue}
            value={valueCents}
            onChange={setValueCents}
          />
          <Button onClick={saveValue} disabled={saving}>
            {saving ? t.common.loading : t.common.save}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
