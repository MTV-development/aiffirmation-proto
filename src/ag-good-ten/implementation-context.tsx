'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ImplementationContextType = {
  implementation: string;
  setImplementation: (impl: string) => void;
  implementations: string[];
  isLoading: boolean;
};

const ImplementationContext = createContext<ImplementationContextType | null>(null);

export function ImplementationProvider({ children }: { children: ReactNode }) {
  const [implementation, setImplementation] = useState('default');
  const [implementations, setImplementations] = useState<string[]>(['default']);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchImplementations() {
      try {
        const res = await fetch('/api/ag-good-ten/implementations');
        const data = await res.json();
        if (data.implementations && data.implementations.length > 0) {
          setImplementations(data.implementations);
        }
      } catch (err) {
        console.error('Failed to fetch implementations:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchImplementations();
  }, []);

  return (
    <ImplementationContext.Provider
      value={{ implementation, setImplementation, implementations, isLoading }}
    >
      {children}
    </ImplementationContext.Provider>
  );
}

export function useImplementation() {
  const context = useContext(ImplementationContext);
  if (!context) {
    throw new Error('useImplementation must be used within an ImplementationProvider');
  }
  return context;
}
