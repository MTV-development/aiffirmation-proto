'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getAllKeys,
  getUniqueVersions,
  getImplementationsForVersion,
  getEntriesForVersionAndImplementation,
  updateEntry,
  createImplementation,
  createKey,
  deleteKey,
  type KVEntry,
} from '@/lib/kv/service';
import {
  VersionSelector,
  ImplementationSelector,
  KVEntryCard,
  KVEntryEditor,
  CreateImplementationDialog,
  CreateKeyDialog,
} from '@/components/kv-editor';

type LoadingState = 'loading' | 'ready' | 'error';

export default function KVEditorPage() {
  // All keys from database
  const [allKeys, setAllKeys] = useState<string[]>([]);

  // Derived state
  const [versions, setVersions] = useState<string[]>([]);
  const [implementations, setImplementations] = useState<string[]>([]);

  // Selections
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [selectedImplementation, setSelectedImplementation] = useState<string>('');

  // Current entries
  const [entries, setEntries] = useState<KVEntry[]>([]);

  // UI state
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<KVEntry | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false);

  // Load all keys on mount
  useEffect(() => {
    loadKeys();
  }, []);

  // Update versions when keys change
  useEffect(() => {
    const uniqueVersions = getUniqueVersions(allKeys);
    setVersions(uniqueVersions);

    // Auto-select first version if none selected
    if (uniqueVersions.length > 0 && !selectedVersion) {
      setSelectedVersion(uniqueVersions[0]);
    }
  }, [allKeys, selectedVersion]);

  // Update implementations when version changes
  useEffect(() => {
    if (selectedVersion) {
      const impls = getImplementationsForVersion(allKeys, selectedVersion);
      setImplementations(impls);

      // Only auto-select if current selection is not valid for this version
      if (impls.length > 0) {
        if (!impls.includes(selectedImplementation)) {
          // Current selection not available, fall back to default or first
          setSelectedImplementation(impls.includes('default') ? 'default' : impls[0]);
        }
      } else {
        setSelectedImplementation('');
      }
    }
  }, [selectedVersion, allKeys, selectedImplementation]);

  // Load entries when version/implementation changes
  useEffect(() => {
    if (selectedVersion && selectedImplementation) {
      loadEntries();
    }
  }, [selectedVersion, selectedImplementation]);

  const loadKeys = async () => {
    setLoadingState('loading');
    setError(null);

    try {
      const keys = await getAllKeys();
      setAllKeys(keys);
      setLoadingState('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load keys');
      setLoadingState('error');
    }
  };

  const loadEntries = useCallback(async () => {
    if (!selectedVersion || !selectedImplementation) return;

    try {
      const data = await getEntriesForVersionAndImplementation(
        selectedVersion,
        selectedImplementation
      );
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    }
  }, [selectedVersion, selectedImplementation]);

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    setEntries([]);
  };

  const handleImplementationChange = (implementation: string) => {
    setSelectedImplementation(implementation);
    setEntries([]);
  };

  const handleSaveEntry = async (id: string, value: unknown, newKeyName?: string, entry?: KVEntry) => {
    await updateEntry(id, value, newKeyName, entry);
    setEditingEntry(null);
    // Reload keys in case a rename happened (new key created)
    if (newKeyName) {
      const keys = await getAllKeys();
      setAllKeys(keys);
    }
    await loadEntries();
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteKey(id);
    setEditingEntry(null);
    // Reload keys and entries
    const keys = await getAllKeys();
    setAllKeys(keys);
    await loadEntries();
  };

  const handleCreateImplementation = async (
    newName: string,
    sourceImplementation: string
  ) => {
    await createImplementation(selectedVersion, sourceImplementation, newName);
    setShowCreateDialog(false);

    // Reload keys and select the new implementation
    const keys = await getAllKeys();
    setAllKeys(keys);
    setSelectedImplementation(newName);
  };

  const handleCreateKey = async (keyName: string, initialText: string) => {
    await createKey(selectedVersion, selectedImplementation, keyName, { text: initialText });
    setShowCreateKeyDialog(false);

    // Reload keys and entries
    const keys = await getAllKeys();
    setAllKeys(keys);
    await loadEntries();
  };

  if (loadingState === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="font-medium text-red-800 dark:text-red-200">
          Error Loading Data
        </h3>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={loadKeys}
          className="mt-3 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">KV Store Editor</h1>
        <p className="text-gray-500 mt-1">
          Edit key-value entries by version and implementation
        </p>
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <VersionSelector
          versions={versions}
          selectedVersion={selectedVersion}
          onVersionChange={handleVersionChange}
        />
        <ImplementationSelector
          implementations={implementations}
          selectedImplementation={selectedImplementation}
          onImplementationChange={handleImplementationChange}
          onCreateNew={() => setShowCreateDialog(true)}
          disabled={!selectedVersion}
        />
      </div>

      {/* Empty state */}
      {versions.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-gray-500">No entries in the KV store.</p>
          <p className="text-sm text-gray-400 mt-1">
            Run <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npm run db:seed</code> to add demo data.
          </p>
        </div>
      )}

      {/* Entries list */}
      {entries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              Entries ({entries.length})
            </h2>
            <button
              onClick={() => setShowCreateKeyDialog(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Add Key
            </button>
          </div>
          <div className="grid gap-4">
            {entries.map((entry) => (
              <KVEntryCard
                key={entry.id}
                entry={entry}
                onEdit={setEditingEntry}
              />
            ))}
          </div>
        </div>
      )}

      {/* No entries for selection */}
      {selectedVersion && selectedImplementation && entries.length === 0 && versions.length > 0 && (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-gray-500">
            No entries for {selectedVersion}.*.{selectedImplementation}
          </p>
        </div>
      )}

      {/* Edit modal */}
      {editingEntry && (
        <KVEntryEditor
          entry={editingEntry}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
          onCancel={() => setEditingEntry(null)}
        />
      )}

      {/* Create implementation dialog */}
      {showCreateDialog && (
        <CreateImplementationDialog
          version={selectedVersion}
          implementations={implementations}
          onConfirm={handleCreateImplementation}
          onCancel={() => setShowCreateDialog(false)}
        />
      )}

      {/* Create key dialog */}
      {showCreateKeyDialog && (
        <CreateKeyDialog
          version={selectedVersion}
          implementation={selectedImplementation}
          existingKeys={entries.map(e => e.parsed.keyName)}
          onConfirm={handleCreateKey}
          onCancel={() => setShowCreateKeyDialog(false)}
        />
      )}
    </div>
  );
}
