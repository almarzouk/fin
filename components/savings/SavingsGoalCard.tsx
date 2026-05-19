"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency, fromCents, toCents } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { SavingsGoalDTO } from "@/types";
import { TrendingUp, Minus, Plus, Pencil, CalendarDays } from "lucide-react";

interface SavingsGoalCardProps {
  goal: SavingsGoalDTO;
  onUpdate: () => void;
}

const COLOR_MAP: Record<string, string> = {
  amber:  "bg-amber-500",
  blue:   "bg-blue-500",
  green:  "bg-green-500",
  violet: "bg-violet-500",
  rose:   "bg-rose-500",
  sky:    "bg-sky-500",
};

type DialogMode = "deposit" | "withdraw" | "edit" | null;

export function SavingsGoalCard({ goal, onUpdate }: SavingsGoalCardProps) {
  const { t, locale } = useLocale();
  const [mode, setMode]     = useState<DialogMode>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote]     = useState("");
  const [editName, setEditName]       = useState(goal.name);
  const [editTarget, setEditTarget]   = useState(String(fromCents(goal.targetAmount)));
  const [editMonthly, setEditMonthly] = useState(String(fromCents(goal.monthlyDeposit)));
  const [loading, setLoading]         = useState(false);

  const currency = goal.currency;
  const barColor = COLOR_MAP[goal.color] ?? "bg-amber-500";

  const closeDialog = () => {
    setMode(null);
    setAmount("");
    setNote("");
  };

  const handleDeposit = useCallback(async (isWithdraw: boolean) => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || isNaN(cents)) return;
    setLoading(true);
    try {
      await fetch(`/api/savings-goals/${goal._id}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: isWithdraw ? -cents : cents, note }),
      });
      onUpdate();
      closeDialog();
    } finally {
      setLoading(false);
    }
  }, [amount, note, goal._id, onUpdate]);

  const handleEdit = useCallback(async () => {
    setLoading(true);
    try {
      await fetch(`/api/savings-goals/${goal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          targetAmount: toCents(parseFloat(editTarget)),
          monthlyDeposit: toCents(parseFloat(editMonthly)),
        }),
      });
      onUpdate();
      closeDialog();
    } finally {
      setLoading(false);
    }
  }, [editName, editTarget, editMonthly, goal._id, onUpdate]);

  const { savings: s } = t;
  const pct = goal.progressPercent;

  return (
    <Card className={cn("border-2", goal.isPrimary && "border-amber-500/40 bg-amber-500/5")}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{goal.emoji}</span>
          <div>
            <CardTitle className="text-base">{goal.name}</CardTitle>
            {goal.isPrimary && (
              <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs mt-0.5">
                {s.primaryBadge}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditName(goal.name); setMode("edit"); }}>
          <Pencil className="size-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-semibold text-lg">{formatCurrency(goal.currentBalance, currency, locale)}</span>
            <span className="text-muted-foreground">{s.of} {formatCurrency(goal.targetAmount, currency, locale)}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", barColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{pct}%</span>
            <span>{formatCurrency(goal.targetAmount - goal.currentBalance, currency, locale)} {s.remaining}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted/40 p-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <TrendingUp className="size-3" />
              {s.monthlyDeposit}
            </div>
            <p className="font-semibold">{formatCurrency(goal.monthlyDeposit, currency, locale)}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <CalendarDays className="size-3" />
              {s.timeToGoal}
            </div>
            <p className="font-semibold">
              {goal.monthsToGoal === 0
                ? s.goalReached
                : goal.monthsToGoal === null
                ? s.noDeposit
                : `${goal.monthsToGoal} ${s.months}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1 gap-1.5" onClick={() => setMode("deposit")}>
            <Plus className="size-3.5" /> {s.deposit}
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => setMode("withdraw")}>
            <Minus className="size-3.5" /> {s.withdraw}
          </Button>
        </div>
      </CardContent>

      {/* Deposit / Withdraw Dialog */}
      <Dialog open={mode === "deposit" || mode === "withdraw"} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "deposit" ? s.addDeposit : s.addWithdrawal}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{s.amountEur}</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{s.noteOptional}</Label>
              <Input
                placeholder={s.notePlaceholder}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>{t.common.cancel}</Button>
            <Button onClick={() => handleDeposit(mode === "withdraw")} disabled={loading || !amount}>
              {loading ? t.common.loading : t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={mode === "edit"} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{s.editGoal}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{s.goalName}</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{s.targetAmount} (€)</Label>
              <Input type="number" min="1" value={editTarget} onChange={(e) => setEditTarget(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{s.monthlyDeposit} (€)</Label>
              <Input type="number" min="0" value={editMonthly} onChange={(e) => setEditMonthly(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>{t.common.cancel}</Button>
            <Button onClick={handleEdit} disabled={loading || !editName}>
              {loading ? t.common.loading : t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
