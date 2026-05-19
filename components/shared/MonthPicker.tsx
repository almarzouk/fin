"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/providers/LocaleProvider";

interface MonthPickerProps {
  value: string;
  onChange: (month: string) => void;
  label?: string;
}

export function MonthPicker({ value, onChange, label }: MonthPickerProps) {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="month-picker">{label ?? t.expenses.month}</Label>
      <Input
        id="month-picker"
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-40"
      />
    </div>
  );
}
