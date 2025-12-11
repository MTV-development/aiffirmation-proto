'use client';

import { TIMING_OPTIONS } from '@/src/full-process';

interface StepTimingProps {
  /** Array of selected preset IDs */
  selectedPresets: string[];
  /** Custom text value */
  customText: string;
  /** Callback when preset selection changes */
  onPresetsChange: (presetIds: string[]) => void;
  /** Callback when custom text changes */
  onCustomChange: (text: string) => void;
}

/**
 * Step 2: Timing
 * Multi-select from 3 preset buttons AND/OR custom text input
 * Custom text is additive to preset selections
 */
export function StepTiming({
  selectedPresets,
  customText,
  onPresetsChange,
  onCustomChange,
}: StepTimingProps) {
  const handlePresetToggle = (presetId: string) => {
    if (selectedPresets.includes(presetId)) {
      // Remove from selection
      onPresetsChange(selectedPresets.filter((id) => id !== presetId));
    } else {
      // Add to selection
      onPresetsChange([...selectedPresets, presetId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {TIMING_OPTIONS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetToggle(preset.id)}
            className={`px-6 py-3 rounded-full border-2 font-medium transition-all ${
              selectedPresets.includes(preset.id)
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Select one or more options. You can also add custom timing below.
      </p>

      <div>
        <label htmlFor="custom-timing" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom timing (optional)
        </label>
        <input
          id="custom-timing"
          type="text"
          value={customText}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="e.g., Before important meetings"
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}
