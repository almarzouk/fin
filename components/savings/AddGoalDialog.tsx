"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/providers/LocaleProvider";
import { toCents } from "@/lib/utils";

const EMOJIS = ["🛡️","🎯","✈️","🏠","🚗","📱","💍","🏖️","🎓","💻"];
const COLORS = ["amber","blue","green","violet","rose","sky"];

interface AddGoalDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddGoalDialog({ open, onClose, onCreated }: AddGoalDialogProps) {
  const { t } = useLocale();
  const s = t.savings;
  const [name, setName]         = useState("");
  const [emoji, setEmoji]       = useState("🎯");
  const [target, setTarget]     = useState("");
  const [monthly, setMonthly]   = useState("");
  const [color, setColor]       = useState("blue");
  const [loading, setLoading]   = useState(false);

  const reset = () => {
    setName(""); setEmoji("🎯"); setTarget(""); setMonthly(""); setColor("blue");
  };

  const handleCreate = async () => {
    if (!name || !target) return;
    setLoading(true);
    try {
      await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          emoji,
          targetAmount:  toCents(parseFloat(target)),
          monthlyDeposit: monthly ? toCents(parseFloat(monthly)) : 0,
          color,
        }),
      });
      reset();
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{s.newGoal}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Emoji picker */}
          <div className="space-y-1.5">
            <Label>{s.chooseEmoji}</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl rounded-lg p-1.5 border-2 transition-colors ${emoji === e ? "border-primary" : "border-transparent"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{s.goalName}</Label>
            <Input
              placeholder={s.goalNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{s.targetAmount} (€)</Label>
              <Input type="number" min="1" placeholder="5000" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{s.monthlyDeposit} (€)</Label>
              <Input type="number" min="0" placeholder="200" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label>{s.color}</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`size-7 rounded-full border-2 transition-transform ${color === c ? "border-foreground scale-110" : "border-transparent"} bg-${c}-500`}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.common.cancel}</Button>
          <Button onClick={handleCreate} disabled={loading || !name || !target}>
            {loading ? t.common.loading : s.createGoal}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
