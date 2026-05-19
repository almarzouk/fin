"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const cache = new Map<string, { data: unknown; at: number }>();
const CACHE_MS = 20_000;

export function useFetch<T>(url: string | null, options?: { skip?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url && !options?.skip);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef(url);

  const load = useCallback(
    async (force = false) => {
      if (!url || options?.skip) return;
      const cached = cache.get(url);
      if (!force && cached && Date.now() - cached.at < CACHE_MS) {
        setData(cached.data as T);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("fetch_failed");
        const json = (await res.json()) as T;
        cache.set(url, { data: json, at: Date.now() });
        setData(json);
      } catch {
        setError("error");
      } finally {
        setLoading(false);
      }
    },
    [url, options?.skip]
  );

  useEffect(() => {
    if (url !== urlRef.current) {
      urlRef.current = url;
      setData(null);
    }
    load();
  }, [load, url]);

  const refresh = useCallback(() => {
    if (url) cache.delete(url);
    return load(true);
  }, [load, url]);

  return { data, loading, error, refresh };
}

export function invalidateFetchCache(prefix?: string) {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
