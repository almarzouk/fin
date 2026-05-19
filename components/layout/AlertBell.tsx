"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { AlertDTO } from "@/types";
import { cn } from "@/lib/utils";

export function AlertBell() {
  const { t } = useLocale();
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);

  const fetchAlerts = useCallback(async () => {
    const res = await fetch("/api/alerts");
    if (res.ok) {
      const data = await res.json();
      setAlerts(data);
    }
  }, []);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (open) fetchAlerts();
  }, [open, fetchAlerts]);

  const markRead = async (id: string) => {
    await fetch(`/api/alerts/${id}`, { method: "PUT" });
    fetchAlerts();
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "danger":
        return "text-red-500";
      case "warning":
        return "text-amber-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {alerts.length > 0 && (
            <Badge
              className="absolute -top-1 -end-1 size-5 justify-center rounded-full p-0 text-[10px]"
              variant="destructive"
            >
              {alerts.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="px-3 py-2 border-b border-border flex justify-between items-center">
          <span className="font-semibold text-sm">{t.alerts.title}</span>
          {alerts.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {alerts.length} {t.alerts.unread}
            </Badge>
          )}
        </div>
        {alerts.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground text-center">
            {t.dashboard.noAlerts}
          </p>
        ) : (
          alerts.map((alert) => (
            <DropdownMenuItem
              key={alert._id}
              className="flex flex-col items-start gap-1 cursor-pointer"
              onClick={() => markRead(alert._id)}
            >
              <span className={cn("font-medium text-sm", typeColor(alert.type))}>
                {alert.title}
              </span>
              <span className="text-xs text-muted-foreground line-clamp-2">
                {alert.message}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
