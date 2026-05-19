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
  EXPENSE_CATEGORIES,
  EXPENSE_ITEM_PRESETS,
  findExpensePreset,
  resolveDatePreset,
} from "@/lib/presets";
import { labelForExpense } from "@/lib/preset-labels";

interface ExpenseFormProps {
  onSuccess: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState(EXPENSE_ITEM_PRESETS[0].id);
  const preset = findExpensePreset(itemId) ?? EXPENSE_ITEM_PRESETS[0];
  const [amount, setAmount] = useState(preset.defaultAmount);
  const [category, setCategory] = useState(preset.category);
  const [type, setType] = useState(preset.type);
  const [date, setDate] = useState(resolveDatePreset("today"));

  const onItemChange = (id: string) => {
    setItemId(id);
    const p = findExpensePreset(id);
    if (p) {
      setAmount(p.defaultAmount);
      setCategory(p.category);
      setType(p.type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: itemId,
          amount,
          category,
          type,
          date,
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
        <CardTitle>{t.expenses.add}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <fieldset className="space-y-2 border-0 p-0 sm:col-span-2">
            <Label>{t.presets.expenseItem}</Label>
            <Select value={itemId} onValueChange={onItemChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_ITEM_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {labelForExpense(t, p.id)}
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
            <Label>{t.expenses.category}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t.expenses.categories[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </fieldset>

          <fieldset className="space-y-2 border-0 p-0">
            <Label>{t.expenses.type}</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="necessary">{t.expenses.necessary}</SelectItem>
                <SelectItem value="unnecessary">{t.expenses.unnecessary}</SelectItem>
                <SelectItem value="investment">{t.expenses.investment}</SelectItem>
              </SelectContent>
            </Select>
          </fieldset>

          <DatePresetSelect
            label={t.expenses.date}
            value={date}
            onChange={setDate}
          />

          <section className="sm:col-span-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? t.common.loading : t.common.save}
            </Button>
          </section>
        </form>
      </CardContent>
    </Card>
  );
}
