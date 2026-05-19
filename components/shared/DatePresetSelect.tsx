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
import { DATE_PRESETS, resolveDatePreset, type DatePresetId } from "@/lib/presets";

interface DatePresetSelectProps {
  value: string;
  onChange: (isoDate: string) => void;
  label?: string;
}

export function DatePresetSelect({ value, onChange, label }: DatePresetSelectProps) {
  const { t } = useLocale();

  const currentPreset =
    DATE_PRESETS.find((id) => resolveDatePreset(id) === value) ?? "today";

  return (
    <fieldset className="space-y-2 border-0 p-0">
      {label && <Label>{label}</Label>}
      <Select
        value={currentPreset}
        onValueChange={(id) => onChange(resolveDatePreset(id as DatePresetId))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map((id) => (
            <SelectItem key={id} value={id}>
              {t.presets.dates[id]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </fieldset>
  );
}
