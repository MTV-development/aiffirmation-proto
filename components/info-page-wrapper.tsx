import { ReactNode } from 'react';

interface InfoPageWrapperProps {
  children: ReactNode;
  id: string;
  name: string;
  tagline: string;
}

/**
 * Shared wrapper component for all version info pages.
 * Provides consistent padding, max-width, and header styling.
 */
export function InfoPageWrapper({ children, id, name, tagline }: InfoPageWrapperProps) {
  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold mb-2">{id}: {name}</h2>
      <p className="text-sm text-purple-600 dark:text-purple-400 mb-6">{tagline}</p>
      {children}
    </div>
  );
}

/**
 * Summary box component for the intro paragraph with "Best for..." callout
 */
export function InfoSummaryBox({ children }: { children: ReactNode }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-8">
      <p className="text-gray-700 dark:text-gray-300">{children}</p>
    </div>
  );
}

/**
 * Highlighted "Best for" text within summary box
 */
export function BestFor({ children }: { children: ReactNode }) {
  return (
    <strong className="text-purple-600 dark:text-purple-400"> {children}</strong>
  );
}

/**
 * Section component for consistent spacing
 */
export function InfoSection({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`mb-8 ${className}`}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Collapsible technical details section
 */
export function TechnicalDetails({ children }: { children: ReactNode }) {
  return (
    <details className="mb-8">
      <summary className="cursor-pointer text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
        Technical Details
      </summary>
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
        {children}
      </div>
    </details>
  );
}
