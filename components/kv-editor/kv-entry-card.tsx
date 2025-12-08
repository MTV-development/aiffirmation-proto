'use client';

import type { KVEntry } from '@/lib/kv/service';

type KVEntryCardProps = {
  entry: KVEntry;
  onEdit: (entry: KVEntry) => void;
};

export function KVEntryCard({ entry, onEdit }: KVEntryCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg">{entry.parsed.keyName}</h3>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{entry.key}</p>
        </div>
        <button
          onClick={() => onEdit(entry)}
          className="ml-4 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
          title="Edit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      </div>
      <div className="mt-3">
        <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto">
          {JSON.stringify(entry.value, null, 2)}
        </pre>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Updated: {new Date(entry.updated_at).toLocaleString()}
      </div>
    </div>
  );
}
