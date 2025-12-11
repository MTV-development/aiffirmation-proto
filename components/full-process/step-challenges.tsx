'use client';

import { CHALLENGE_BADGES } from '@/src/full-process';

interface StepChallengesProps {
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
 * Step 3: Challenges
 * Multi-select from 6 toggleable badges AND/OR custom text input
 * This step is optional - user can proceed without selecting any
 * Custom text is additive to preset selections
 */
export function StepChallenges({
  selectedPresets,
  customText,
  onPresetsChange,
  onCustomChange,
}: StepChallengesProps) {
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
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Select any challenges you&apos;d like your affirmations to address. This step is optional.
      </p>

      <div className="flex flex-wrap gap-2">
        {CHALLENGE_BADGES.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetToggle(preset.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
              selectedPresets.includes(preset.id)
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="custom-challenges" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Other challenges (optional)
        </label>
        <input
          id="custom-challenges"
          type="text"
          value={customText}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="e.g., Fear of public speaking"
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}
