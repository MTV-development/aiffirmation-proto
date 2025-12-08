'use client';

import { useState } from 'react';
import type { KVEntry } from '@/lib/kv/service';

type KVEntryEditorProps = {
  entry: KVEntry;
  onSave: (id: string, value: unknown) => Promise<void>;
  onCancel: () => void;
};

export function KVEntryEditor({ entry, onSave, onCancel }: KVEntryEditorProps) {
  const [jsonValue, setJsonValue] = useState(() =>
    JSON.stringify(entry.value, null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError(null);

    // Validate JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonValue);
    } catch {
      setError('Invalid JSON format');
      return;
    }

    setSaving(true);
    try {
      await onSave(entry.id, parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Edit: {entry.parsed.keyName}</h2>
          <p className="text-sm text-gray-500 font-mono">{entry.key}</p>
        </div>

        <div className="p-4">
          <label className="block text-sm font-medium mb-2">Value (JSON)</label>
          <textarea
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            className="w-full h-64 font-mono text-sm p-3 border rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
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
