"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency } from "@/lib/utils";
import { labelForExpense, labelForPlanItem } from "@/lib/preset-labels";
import type { ExpenseDTO } from "@/types";
import { cn } from "@/lib/utils";

interface ExpenseTableProps {
  expenses: ExpenseDTO[];
  currency?: string;
  loading?: boolean;
  onDelete: (id: string) => void;
}

export function ExpenseTable({
  expenses,
  currency = "EUR",
  loading,
  onDelete,
}: ExpenseTableProps) {
  const { t, locale } = useLocale();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <p className="text-center text-muted-foreground py-8">{t.expenses.noData}</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.salary.label}</TableHead>
          <TableHead>{t.expenses.category}</TableHead>
          <TableHead>{t.expenses.type}</TableHead>
          <TableHead>{t.expenses.date}</TableHead>
          <TableHead className="text-end">Amount</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((exp) => (
          <TableRow
            key={exp._id}
            className={cn(
              exp.type === "unnecessary" && "bg-amber-500/10"
            )}
          >
            <TableCell className="font-medium">
              <span className="flex items-center gap-2">
                {exp.type === "unnecessary" && (
                  <AlertTriangle className="size-4 text-amber-600" />
                )}
                {labelForPlanItem(t, exp.title) !== exp.title
                  ? labelForPlanItem(t, exp.title)
                  : labelForExpense(t, exp.title)}
              </span>
            </TableCell>
            <TableCell>
              {t.expenses.categories[
                exp.category as keyof typeof t.expenses.categories
              ] ?? exp.category}
            </TableCell>
            <TableCell>
              <Badge
                variant={exp.type === "unnecessary" ? "destructive" : "secondary"}
              >
                {exp.type === "necessary"
                  ? t.expenses.necessary
                  : exp.type === "unnecessary"
                    ? t.expenses.unnecessary
                    : t.expenses.investment}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(exp.date).toLocaleDateString(
                locale === "ar" ? "ar-SA" : "de-DE"
              )}
            </TableCell>
            <TableCell className="text-end font-mono">
              {formatCurrency(exp.amount, currency, locale)}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(exp._id)}
                aria-label={t.expenses.delete}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
