'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { SessionReference } from './types';

const STORAGE_KEY = 'cs01.session';

// Track subscribers for manual updates
const subscribers = new Set<() => void>();

// Cache for getSnapshot to avoid infinite loops
let cachedSnapshot: SessionReference | null = null;
let cachedRawValue: string | null = null;

function notifySubscribers() {
  subscribers.forEach(callback => callback());
}

function getSnapshot(): SessionReference | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Return cached value if the raw string hasn't changed
    if (stored === cachedRawValue) {
      return cachedSnapshot;
    }
    // Update cache
    cachedRawValue = stored;
    if (stored) {
      cachedSnapshot = JSON.parse(stored) as SessionReference;
    } else {
      cachedSnapshot = null;
    }
    return cachedSnapshot;
  } catch (error) {
    console.error('Failed to load session from localStorage:', error);
    cachedRawValue = null;
    cachedSnapshot = null;
    return null;
  }
}

function getServerSnapshot(): SessionReference | null {
  return null;
}

function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  const handleStorage = () => callback();
  window.addEventListener('storage', handleStorage);
  return () => {
    subscribers.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

export function useSessionStorage() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveSession = useCallback((runId: string, phase: 'chat' | 'swipe') => {
    const newSession: SessionReference = {
      runId,
      createdAt: new Date().toISOString(),
      phase,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      notifySubscribers();
    } catch (error) {
      console.error('Failed to save session to localStorage:', error);
    }
  }, []);

  const updatePhase = useCallback((phase: 'chat' | 'swipe') => {
    const current = getSnapshot();
    if (!current) return;
    const updated = { ...current, phase };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifySubscribers();
    } catch (error) {
      console.error('Failed to update session phase:', error);
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      notifySubscribers();
    } catch (error) {
      console.error('Failed to clear session from localStorage:', error);
    }
  }, []);

  return {
    session,
    isLoaded: true, // With useSyncExternalStore, we're always loaded after hydration
    saveSession,
    updatePhase,
    clearSession,
  };
}
