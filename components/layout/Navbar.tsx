"use client";

import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertBell } from "@/components/layout/AlertBell";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Locale } from "@/types";

export function Navbar() {
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      <div>
        <h1 className="text-lg font-bold tracking-tight">{t.app.title}</h1>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {t.app.subtitle}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title={t.nav.language}>
              <Languages className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(["de", "ar"] as Locale[]).map((l) => (
              <DropdownMenuItem
                key={l}
                onClick={() => setLocale(l)}
                className={locale === l ? "font-semibold" : ""}
              >
                {l === "de" ? "Deutsch" : "العربية"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={t.nav.theme}
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <AlertBell />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="gap-2"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">{t.nav.logout}</span>
        </Button>
      </div>
    </header>
  );
}
