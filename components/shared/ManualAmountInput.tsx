"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fromCents, toCents, parseDisplayAmount } from "@/lib/utils";

interface ManualAmountInputProps {
  label?: string;
  valueCents: number;
  onChange: (cents: number) => void;
  placeholder?: string;
}

/** Manual € input — stored as cents; keeps local text while typing */
export function ManualAmountInput({
  label,
  valueCents,
  onChange,
  placeholder = "0.00",
}: ManualAmountInputProps) {
  const [text, setText] = useState(
    valueCents === 0 ? "" : String(fromCents(valueCents))
  );
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(valueCents === 0 ? "" : String(fromCents(valueCents)));
    }
  }, [valueCents, focused]);

  return (
    <fieldset className="space-y-2 border-0 p-0">
      {label && <Label>{label}</Label>}
      <Input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          const cents = toCents(parseDisplayAmount(text || "0"));
          onChange(cents);
          setText(cents === 0 ? "" : String(fromCents(cents)));
        }}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d.,]/g, "");
          setText(next);
          onChange(toCents(parseDisplayAmount(next || "0")));
        }}
      />
    </fieldset>
  );
}
