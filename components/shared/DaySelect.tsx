"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DAYS_OF_MONTH } from "@/lib/presets";

interface DaySelectProps {
  value: number;
  onChange: (day: number) => void;
  label?: string;
}

export function DaySelect({ value, onChange, label }: DaySelectProps) {
  return (
    <fieldset className="space-y-2 border-0 p-0">
      {label && <Label>{label}</Label>}
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {DAYS_OF_MONTH.map((d) => (
            <SelectItem key={d} value={String(d)}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </fieldset>
  );
}
