'use client';

import { useEffect, useMemo, useState } from 'react';

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const stableInitial = useMemo(() => initialValue, [initialValue]);
  const [state, setState] = useState<T>(stableInitial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setState(JSON.parse(raw) as T);
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state, hydrated]);

  return { state, setState, hydrated } as const;
}


