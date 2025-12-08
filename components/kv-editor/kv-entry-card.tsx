'use client';

import { useState } from 'react';
import type { KVEntry } from '@/lib/kv/service';

type KVEntryCardProps = {
  entry: KVEntry;
  onEdit: (entry: KVEntry) => void;
};

type ValueObject = {
  text?: string;
  [key: string]: unknown;
};

export function KVEntryCard({ entry, onEdit }: KVEntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const value = entry.value as ValueObject;
  const hasText = typeof value?.text === 'string';
  const textContent = hasText ? value.text : null;
  const otherProps = hasText
    ? Object.fromEntries(Object.entries(value).filter(([k]) => k !== 'text'))
    : null;
  const hasOtherProps = otherProps && Object.keys(otherProps).length > 0;

  // For non-text values, show as JSON
  const isSimpleValue = !hasText;

  // Determine if content is long enough to need expand/collapse
  const textLength = textContent?.length ?? 0;
  const isLongText = textLength > 300;
  const shouldTruncate = isLongText && !isExpanded;

  const displayText = shouldTruncate
    ? textContent?.slice(0, 300) + '...'
    : textContent;

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg">{entry.parsed.keyName}</h3>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {entry.parsed.keyName}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-1">{entry.key}</p>
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

      {/* Content */}
      <div className="p-4">
        {hasText ? (
          <div className="space-y-3">
            {/* Text content - displayed as wrapped prose */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-sm whitespace-pre-wrap break-words leading-relaxed text-gray-700 dark:text-gray-300">
                {displayText}
              </div>
              {isLongText && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {isExpanded ? 'Show less' : `Show more (${textLength} characters)`}
                </button>
              )}
            </div>

            {/* Other properties if any */}
            {hasOtherProps && (
              <details className="group">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  Other properties ({Object.keys(otherProps).length})
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto">
                  {JSON.stringify(otherProps, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ) : (
          /* Non-text values - show as formatted JSON */
          <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(value, null, 2)}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-400">
          Updated: {new Date(entry.updated_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
