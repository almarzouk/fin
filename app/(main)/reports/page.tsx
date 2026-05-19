"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { MonthPicker } from "@/components/shared/MonthPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getCurrentMonth, formatCurrency, calculateProfit } from "@/lib/utils";
import type { ExpenseDTO, InvestmentDTO } from "@/types";

const PIE_COLORS = ["#22c55e", "#ef4444", "#3b82f6"];

export default function ReportsPage() {
  const { t, locale } = useLocale();
  const [month, setMonth] = useState(getCurrentMonth());
  const [salary, setSalary] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [investments, setInvestments] = useState<InvestmentDTO[]>([]);
  const [allocations, setAllocations] = useState<
    { label: string; amount: number; category: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [salRes, expRes, invRes] = await Promise.all([
        fetch(`/api/salary?month=${month}`),
        fetch(`/api/expenses?month=${month}`),
        fetch("/api/investments"),
      ]);
      if (salRes.ok) {
        const s = await salRes.json();
        setSalary(s?.amount ?? 0);
        setAllocations(s?.allocations ?? []);
      }
      if (expRes.ok) setExpenses(await expRes.json());
      if (invRes.ok) setInvestments(await invRes.json());
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const spentPct = salary > 0 ? Math.min((totalSpent / salary) * 100, 100) : 0;

  const byCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {})
  ).map(([category, total]) => ({ category, total: total / 100 }));

  const necessary = expenses
    .filter((e) => e.type === "necessary")
    .reduce((s, e) => s + e.amount, 0);
  const unnecessary = expenses
    .filter((e) => e.type === "unnecessary")
    .reduce((s, e) => s + e.amount, 0);
  const investExp = expenses
    .filter((e) => e.type === "investment")
    .reduce((s, e) => s + e.amount, 0);

  const typePie = [
    { name: t.expenses.necessary, value: necessary / 100 },
    { name: t.expenses.unnecessary, value: unnecessary / 100 },
    { name: t.expenses.investment, value: investExp / 100 },
  ].filter((d) => d.value > 0);

  const dangerZones = allocations
    .map((a) => {
      const spent = expenses
        .filter((e) => e.category === a.label || e.category === a.category)
        .reduce((s, e) => s + e.amount, 0);
      return { label: a.label, allocated: a.amount, spent };
    })
    .filter((z) => z.spent > z.allocated);

  if (loading) {
    return <p className="text-muted-foreground">{t.common.loading}</p>;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">{t.reports.title}</h2>
      <MonthPicker value={month} onChange={setMonth} label={t.reports.month} />

      <Card>
        <CardHeader>
          <CardTitle>{t.reports.salaryVsSpent}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <section className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <section
              className="h-full bg-red-500 transition-all"
              style={{ width: `${spentPct}%` }}
            />
          </section>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(totalSpent, "EUR", locale)} /{" "}
            {formatCurrency(salary, "EUR", locale)}
          </p>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.reports.byCategory}</CardTitle>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.common.empty}</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.reports.necessaryVsUnnecessary}</CardTitle>
          </CardHeader>
          <CardContent>
            {typePie.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.common.empty}</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={typePie} dataKey="value" nameKey="name" outerRadius={100}>
                    {typePie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t.reports.investmentPerformance}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.salary.label}</TableHead>
                <TableHead>{t.investments.invested}</TableHead>
                <TableHead>{t.investments.currentValue}</TableHead>
                <TableHead>P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((inv) => {
                const { profit, percentage } = calculateProfit(
                  inv.amount,
                  inv.currentValue
                );
                return (
                  <TableRow key={inv._id}>
                    <TableCell>{inv.title}</TableCell>
                    <TableCell>
                      {formatCurrency(inv.amount, "EUR", locale)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(inv.currentValue, "EUR", locale)}
                    </TableCell>
                    <TableCell
                      className={profit >= 0 ? "text-green-600" : "text-red-600"}
                    >
                      {formatCurrency(profit, "EUR", locale)} ({percentage.toFixed(1)}%)
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.reports.dangerZones}</CardTitle>
        </CardHeader>
        <CardContent>
          {dangerZones.length === 0 ? (
            <p className="text-sm text-green-600">{t.reports.noDanger}</p>
          ) : (
            <ul className="space-y-2">
              {dangerZones.map((z) => (
                <li
                  key={z.label}
                  className="text-sm text-red-600 border border-red-200 rounded-lg p-3"
                >
                  {z.label}: {t.reports.exceeded} —{" "}
                  {formatCurrency(z.spent, "EUR", locale)} /{" "}
                  {formatCurrency(z.allocated, "EUR", locale)}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
