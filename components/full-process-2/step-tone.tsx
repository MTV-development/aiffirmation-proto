'use client';

import { TONE_CARDS } from '@/src/full-process';
import type { PresetOption } from '@/src/full-process';

interface StepToneProps {
  /** Currently selected preset ID (null if custom) */
  selectedPreset: string | null;
  /** Custom text value */
  customText: string;
  /** Callback when preset selection changes */
  onPresetChange: (presetId: string | null) => void;
  /** Callback when custom text changes */
  onCustomChange: (text: string) => void;
}

/**
 * Step 4: Tone
 * Single-select from 4 preset cards OR custom text input
 * Selecting a preset clears custom text and vice versa
 */
export function StepTone({
  selectedPreset,
  customText,
  onPresetChange,
  onCustomChange,
}: StepToneProps) {
  const handlePresetClick = (preset: PresetOption) => {
    if (selectedPreset === preset.id) {
      // Deselect if clicking the same preset
      onPresetChange(null);
    } else {
      // Select new preset and clear custom text
      onPresetChange(preset.id);
      onCustomChange('');
    }
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onCustomChange(value);
    // Clear preset when typing custom text
    if (value.trim()) {
      onPresetChange(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {TONE_CARDS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetClick(preset)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedPreset === preset.id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="font-medium">{preset.label}</div>
            {preset.description && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {preset.description}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or</span>
        </div>
      </div>

      <div>
        <label htmlFor="custom-tone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Describe your preferred tone
        </label>
        <input
          id="custom-tone"
          type="text"
          value={customText}
          onChange={handleCustomTextChange}
          placeholder="e.g., Warm and encouraging like a supportive friend"
          className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
            customText.trim() && !selectedPreset
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700'
          } dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>
    </div>
  );
}
