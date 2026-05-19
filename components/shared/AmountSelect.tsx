"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatCurrency } from "@/lib/utils";
import { AMOUNT_PRESETS } from "@/lib/presets";

interface AmountSelectProps {
  value: number;
  onChange: (cents: number) => void;
  label?: string;
  options?: readonly number[];
}

export function AmountSelect({
  value,
  onChange,
  label,
  options = AMOUNT_PRESETS,
}: AmountSelectProps) {
  const { locale } = useLocale();
  const str = String(value);

  return (
    <fieldset className="space-y-2 border-0 p-0">
      {label && <Label>{label}</Label>}
      <Select value={str} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger>
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {options.map((cents) => (
            <SelectItem key={cents} value={String(cents)}>
              {formatCurrency(cents, "EUR", locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </fieldset>
  );
}
