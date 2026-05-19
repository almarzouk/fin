"use client";

import { useCallback, useEffect, useState } from "react";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { WarningBanner } from "@/components/shared/WarningBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getCurrentMonth, formatCurrency } from "@/lib/utils";
import type { ExpenseDTO } from "@/types";

export default function ExpensesPage() {
  const { t, locale } = useLocale();
  const [month, setMonth] = useState(getCurrentMonth());
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [salaryAmount, setSalaryAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month });
      if (category !== "all") params.set("category", category);
      if (type !== "all") params.set("type", type);
      const [expRes, salRes] = await Promise.all([
        fetch(`/api/expenses?${params}`),
        fetch(`/api/salary?month=${month}`),
      ]);
      if (expRes.ok) setExpenses(await expRes.json());
      if (salRes.ok) {
        const sal = await salRes.json();
        setSalaryAmount(sal?.amount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [month, category, type]);

  useEffect(() => {
    load();
  }, [load]);

  const monthlyTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const unnecessaryTotal = expenses
    .filter((e) => e.type === "unnecessary")
    .reduce((s, e) => s + e.amount, 0);
  const showWarning =
    salaryAmount > 0 && unnecessaryTotal > salaryAmount * 0.15;

  const handleDelete = async (id: string) => {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">{t.expenses.title}</h2>
      {showWarning && <WarningBanner message={t.expenses.warningBanner} />}
      <Card>
        <CardHeader>
          <CardTitle>{t.expenses.monthlyTotal}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(monthlyTotal, "EUR", locale)}
          </p>
        </CardContent>
      </Card>
      <ExpenseForm onSuccess={load} />
      <Card>
        <CardHeader>
          <CardTitle>{t.expenses.filters}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <MonthPicker value={month} onChange={setMonth} />
          <fieldset className="space-y-2 border-0 p-0">
            <Label>{t.expenses.category}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.common.all}</SelectItem>
                {(
                  [
                    "food",
                    "transport",
                    "entertainment",
                    "utilities",
                    "health",
                    "other",
                  ] as const
                ).map((c) => (
                  <SelectItem key={c} value={c}>
                    {t.expenses.categories[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </fieldset>
          <fieldset className="space-y-2 border-0 p-0">
            <Label>{t.expenses.type}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.common.all}</SelectItem>
                <SelectItem value="necessary">{t.expenses.necessary}</SelectItem>
                <SelectItem value="unnecessary">{t.expenses.unnecessary}</SelectItem>
                <SelectItem value="investment">{t.expenses.investment}</SelectItem>
              </SelectContent>
            </Select>
          </fieldset>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <ExpenseTable
            expenses={expenses}
            loading={loading}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </section>
  );
}
