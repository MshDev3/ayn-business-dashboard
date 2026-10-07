import { useEffect, useState } from 'react';

const seen = new Set<string>();

/**
 * Simulates first-visit data latency so skeleton loaders are shown naturally.
 * Each key only "loads" once per page session, so navigating back is instant.
 */
export function useInitialLoading(key: string, delayMs = 320): boolean {
  const [loading, setLoading] = useState(() => !seen.has(key));

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => {
      seen.add(key);
      setLoading(false);
    }, delayMs);
    return () => window.clearTimeout(timer);
  }, [key, delayMs, loading]);

  return loading;
}
