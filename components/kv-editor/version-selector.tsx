'use client';

type VersionSelectorProps = {
  versions: string[];
  selectedVersion: string;
  onVersionChange: (version: string) => void;
  disabled?: boolean;
};

export function VersionSelector({
  versions,
  selectedVersion,
  onVersionChange,
  disabled = false,
}: VersionSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="version-select" className="text-sm font-medium">
        Version:
      </label>
      <select
        id="version-select"
        value={selectedVersion}
        onChange={(e) => onVersionChange(e.target.value)}
        disabled={disabled || versions.length === 0}
        className="px-3 py-1.5 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
      >
        {versions.length === 0 ? (
          <option value="">No versions</option>
        ) : (
          versions.map((version) => (
            <option key={version} value={version}>
              {version}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
