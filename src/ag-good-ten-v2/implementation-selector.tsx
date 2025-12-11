'use client';

import { useImplementation } from './implementation-context';

export function ImplementationSelector() {
  const { implementation, setImplementation, implementations, isLoading } = useImplementation();

  if (isLoading) {
    return (
      <select
        disabled
        className="px-3 py-1 border rounded bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm"
      >
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <select
      value={implementation}
      onChange={(e) => setImplementation(e.target.value)}
      className="px-3 py-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 text-sm cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
    >
      {implementations.map((impl) => (
        <option key={impl} value={impl}>
          {impl}
        </option>
      ))}
    </select>
  );
}
