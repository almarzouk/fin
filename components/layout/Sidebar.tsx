"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  TrendingUp,
  FileBarChart,
  CalendarClock,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";

const links = [
  { href: "/dashboard",    icon: LayoutDashboard, key: "dashboard"   as const },
  { href: "/salary",       icon: Wallet,          key: "salary"      as const },
  { href: "/monthly-plan", icon: CalendarClock,   key: "monthlyPlan" as const },
  { href: "/expenses",     icon: Receipt,         key: "expenses"    as const },
  { href: "/investments",  icon: TrendingUp,      key: "investments" as const },
  { href: "/savings",      icon: PiggyBank,       key: "savings"     as const },
  { href: "/reports",      icon: FileBarChart,    key: "reports"     as const },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <aside
      className={cn(
        "hidden md:flex w-56 flex-col border-e border-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {links.map(({ href, icon: Icon, key }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {t.nav[key]}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {links.map(({ href, icon: Icon, key }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            <span className="truncate px-1">{t.nav[key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
