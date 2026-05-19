import { ar } from "@/messages/ar";
import { de, type Dictionary } from "@/messages/de";
import type { Locale } from "@/types";

const dictionaries: Record<Locale, Dictionary> = { de, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? de;
}

export const locales: Locale[] = ["de", "ar"];
export const defaultLocale: Locale = "de";

export function isRTL(locale: Locale): boolean {
  return locale === "ar";
}
