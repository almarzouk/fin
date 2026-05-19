"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/components/providers/LocaleProvider";
import { AmountSelect } from "@/components/shared/AmountSelect";
import { DatePresetSelect } from "@/components/shared/DatePresetSelect";
import {
  INVESTMENT_PRESETS,
  findInvestmentPreset,
  resolveDatePreset,
} from "@/lib/presets";
import { labelForInvestment } from "@/lib/preset-labels";

interface InvestmentFormProps {
  onSuccess: () => void;
}

export function InvestmentForm({ onSuccess }: InvestmentFormProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState(INVESTMENT_PRESETS[0].id);
  const preset = findInvestmentPreset(itemId) ?? INVESTMENT_PRESETS[0];
  const [amount, setAmount] = useState(preset.defaultAmount);
  const [type, setType] = useState(preset.type);
  const [startDate, setStartDate] = useState(resolveDatePreset("today"));

  const onItemChange = (id: string) => {
    setItemId(id);
    const p = findInvestmentPreset(id);
    if (p) {
      setAmount(p.defaultAmount);
      setType(p.type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: itemId,
          amount,
          currentValue: amount,
          type,
          startDate,
        }),
      });
      if (res.ok) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.investments.add}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <fieldset className="space-y-2 border-0 p-0 sm:col-span-2">
            <Label>{t.presets.investmentItem}</Label>
            <Select value={itemId} onValueChange={onItemChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVESTMENT_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {labelForInvestment(t, p.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </fieldset>

          <AmountSelect
            label={t.presets.amount}
            value={amount}
            onChange={setAmount}
          />

          <fieldset className="space-y-2 border-0 p-0">
            <Label>{t.expenses.type}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["ETF", "stocks", "crypto", "savings", "other"] as const).map(
                  (tp) => (
                    <SelectItem key={tp} value={tp}>
                      {t.investments.types[tp]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </fieldset>

          <DatePresetSelect
            label={t.expenses.date}
            value={startDate}
            onChange={setStartDate}
          />

          <section className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? t.common.loading : t.common.save}
            </Button>
          </section>
        </form>
      </CardContent>
    </Card>
  );
}
