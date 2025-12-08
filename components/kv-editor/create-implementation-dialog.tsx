'use client';

import { useState } from 'react';

type CreateImplementationDialogProps = {
  version: string;
  implementations: string[];
  onConfirm: (newName: string, sourceImplementation: string) => Promise<void>;
  onCancel: () => void;
};

export function CreateImplementationDialog({
  version,
  implementations,
  onConfirm,
  onCancel,
}: CreateImplementationDialogProps) {
  const [newName, setNewName] = useState('');
  const [sourceImplementation, setSourceImplementation] = useState(
    implementations.includes('default') ? 'default' : implementations[0] || ''
  );
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleConfirm = async () => {
    setError(null);

    // Validate name
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setError('Please enter a name');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
      setError('Name can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    if (implementations.includes(trimmedName)) {
      setError('An implementation with this name already exists');
      return;
    }

    setCreating(true);
    try {
      await onConfirm(trimmedName, sourceImplementation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create implementation');
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Create New Implementation</h2>
          <p className="text-sm text-gray-500">For version: {version}</p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Implementation Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., experimental, v2, test"
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Copy From
            </label>
            <select
              value={sourceImplementation}
              onChange={(e) => setSourceImplementation(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              {implementations.map((impl) => (
                <option key={impl} value={impl}>
                  {impl}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              All keys from the selected implementation will be copied to the new one.
            </p>
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
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
