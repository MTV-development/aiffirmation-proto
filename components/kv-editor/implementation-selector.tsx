'use client';

type ImplementationSelectorProps = {
  implementations: string[];
  selectedImplementation: string;
  onImplementationChange: (implementation: string) => void;
  onCreateNew: () => void;
  disabled?: boolean;
};

export function ImplementationSelector({
  implementations,
  selectedImplementation,
  onImplementationChange,
  onCreateNew,
  disabled = false,
}: ImplementationSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="implementation-select" className="text-sm font-medium">
        Implementation:
      </label>
      <select
        id="implementation-select"
        value={selectedImplementation}
        onChange={(e) => onImplementationChange(e.target.value)}
        disabled={disabled || implementations.length === 0}
        className="px-3 py-1.5 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
      >
        {implementations.length === 0 ? (
          <option value="">No implementations</option>
        ) : (
          implementations.map((impl) => (
            <option key={impl} value={impl}>
              {impl}
            </option>
          ))
        )}
      </select>
      <button
        onClick={onCreateNew}
        disabled={disabled}
        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + New
      </button>
    </div>
  );
}
