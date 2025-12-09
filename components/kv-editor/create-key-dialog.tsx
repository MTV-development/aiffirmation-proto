'use client';

import { useState } from 'react';

type CreateKeyDialogProps = {
  version: string;
  implementation: string;
  existingKeys: string[];
  onConfirm: (keyName: string, initialText: string) => Promise<void>;
  onCancel: () => void;
};

export function CreateKeyDialog({
  version,
  implementation,
  existingKeys,
  onConfirm,
  onCancel,
}: CreateKeyDialogProps) {
  const [keyName, setKeyName] = useState('');
  const [initialText, setInitialText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleConfirm = async () => {
    setError(null);

    const trimmedName = keyName.trim();
    if (!trimmedName) {
      setError('Please enter a key name');
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(trimmedName)) {
      setError('Key name must start with a letter or underscore, and contain only letters, numbers, hyphens, and underscores');
      return;
    }

    if (existingKeys.includes(trimmedName)) {
      setError('A key with this name already exists for this implementation');
      return;
    }

    setCreating(true);
    try {
      await onConfirm(trimmedName, initialText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create key');
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Add New Key</h2>
          <p className="text-sm text-gray-500">
            For: {version} / {implementation}
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Key Name
            </label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g., system, prompt, _info"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">
              Will create: versions.{version}.{keyName || '<keyName>'}.{implementation}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Initial Text Value
            </label>
            <textarea
              value={initialText}
              onChange={(e) => setInitialText(e.target.value)}
              placeholder="Enter the initial text content..."
              rows={5}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={creating}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={creating}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Key'}
          </button>
        </div>
      </div>
    </div>
  );
}
