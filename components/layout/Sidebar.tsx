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
        "hidden md:flex w-60 flex-col bg-sidebar text-sidebar-foreground max-h-screen h-full sticky top-0 shrink-0 border-r border-sidebar-border",
        className
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center size-9 rounded-xl bg-primary/15 text-primary shrink-0">
          <Wallet className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-sidebar-foreground">{t.app.title}</p>
          <p className="text-[10px] text-sidebar-foreground/40 truncate">{t.app.subtitle}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {links.map(({ href, icon: Icon, key }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "")} />
              {t.nav[key]}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/30 text-center">Finance OS</p>
      </div>
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
