'use client';

import { useState } from 'react';
import type { KVEntry } from '@/lib/kv/service';

type KVEntryEditorProps = {
  entry: KVEntry;
  onSave: (id: string, value: unknown, newKeyName?: string, entry?: KVEntry) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCancel: () => void;
};

export function KVEntryEditor({ entry, onSave, onDelete, onCancel }: KVEntryEditorProps) {
  const [keyName, setKeyName] = useState(entry.parsed.keyName);
  const [jsonValue, setJsonValue] = useState(() =>
    JSON.stringify(entry.value, null, 2)
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const keyChanged = keyName !== entry.parsed.keyName;

  const handleSave = async () => {
    setError(null);

    // Validate key name
    const trimmedKey = keyName.trim();
    if (!trimmedKey) {
      setError('Key name is required');
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(trimmedKey)) {
      setError('Key name must start with a letter or underscore, and contain only letters, numbers, hyphens, and underscores');
      return;
    }

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
      await onSave(entry.id, parsed, keyChanged ? trimmedKey : undefined, entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(entry.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const newFullKey = keyChanged
    ? `versions.${entry.parsed.version}.${keyName}.${entry.parsed.implementation}`
    : entry.key;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Edit Entry</h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Key name input */}
          <div>
            <label className="block text-sm font-medium mb-1">Key Name</label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 font-mono">
              {keyChanged ? (
                <span className="text-amber-600 dark:text-amber-400">
                  Will rename to: {newFullKey}
                </span>
              ) : (
                newFullKey
              )}
            </p>
          </div>

          {/* Value input */}
          <div>
            <label className="block text-sm font-medium mb-1">Value (JSON)</label>
            <textarea
              value={jsonValue}
              onChange={(e) => setJsonValue(e.target.value)}
              className="w-full h-64 font-mono text-sm p-3 border rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              spellCheck={false}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-between">
          {/* Delete button */}
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 dark:text-red-400">Delete this entry?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                Delete
              </button>
            )}
          </div>

          {/* Save/Cancel buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={saving || deleting}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : keyChanged ? 'Rename & Save' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
