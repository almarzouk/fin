"use client";

import { useEffect, useRef } from "react";

/** Runs once per session: seed demo data (if empty) + auto monthly plan */
export function AppBootstrap() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    fetch("/api/bootstrap", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
