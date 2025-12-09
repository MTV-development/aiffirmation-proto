'use client';

import { useState } from 'react';
import type { KVEntry } from '@/lib/kv/service';

type KVTextEditorProps = {
  entry: KVEntry;
  onSave: (id: string, value: unknown) => Promise<void>;
  onCancel: () => void;
};

type ValueObject = {
  text?: string;
  [key: string]: unknown;
};

export function KVTextEditor({ entry, onSave, onCancel }: KVTextEditorProps) {
  const value = entry.value as ValueObject;
  const [textValue, setTextValue] = useState(value?.text ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    try {
      // Reconstruct the full value object with updated text
      const newValue = {
        ...value,
        text: textValue,
      };
      await onSave(entry.id, newValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Edit Text</h2>
          <p className="text-sm text-gray-500 font-mono mt-1">{entry.key}</p>
        </div>

        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <label className="block text-sm font-medium mb-2">
            Text Content
            <span className="text-gray-400 font-normal ml-2">
              (edit directly - no JSON escaping needed)
            </span>
          </label>
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            className="w-full flex-1 min-h-[400px] font-mono text-sm p-4 border rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            spellCheck={false}
            placeholder="Enter text content..."
          />

          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
