'use client';

import { useState } from 'react';
import { CHALLENGE_BADGES, TONE_CARDS } from '@/src/full-process';
import type { AdjustedPreferences } from '@/src/full-process';

interface AdjustmentPanelProps {
  /** Current challenges (for initial selection state) */
  currentChallenges?: string[];
  /** Current tone (for initial selection state) */
  currentTone?: string;
  /** Callback when adjustments are applied */
  onApply: (adjustments: AdjustedPreferences) => void;
  /** Callback when user wants to go back */
  onBack: () => void;
  /** Loading state during regeneration */
  isLoading?: boolean;
}

/**
 * Panel for adjusting challenges and tone during mid-journey check-in
 */
export function AdjustmentPanel({
  currentChallenges = [],
  currentTone = '',
  onApply,
  onBack,
  isLoading = false,
}: AdjustmentPanelProps) {
  // Find initial preset selections from current values
  const initialChallengeIds = CHALLENGE_BADGES
    .filter(b => currentChallenges.includes(b.label))
    .map(b => b.id);
  const initialToneId = TONE_CARDS.find(t => t.label === currentTone)?.id || null;

  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(initialChallengeIds);
  const [selectedTone, setSelectedTone] = useState<string | null>(initialToneId);
  const [feedback, setFeedback] = useState('');

  const toggleChallenge = (id: string) => {
    setSelectedChallenges(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const selectTone = (id: string) => {
    setSelectedTone(prev => prev === id ? null : id);
  };

  const handleApply = () => {
    const adjustments: AdjustedPreferences = {};

    // Only include challenges if changed
    if (selectedChallenges.length > 0) {
      adjustments.challenges = selectedChallenges.map(
        id => CHALLENGE_BADGES.find(b => b.id === id)?.label || id
      );
    }

    // Only include tone if changed
    if (selectedTone) {
      adjustments.tone = TONE_CARDS.find(t => t.id === selectedTone)?.label || selectedTone;
    }

    // Include feedback if provided
    if (feedback.trim()) {
      adjustments.feedback = feedback.trim();
    }

    onApply(adjustments);
  };

  const hasChanges = selectedChallenges.length > 0 || selectedTone !== null || feedback.trim() !== '';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Adjust Your Preferences</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Modify your preferences to get different affirmations
        </p>
      </div>

      {/* Challenges section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Update challenges (optional)
        </h3>
        <div className="flex flex-wrap gap-2">
          {CHALLENGE_BADGES.map((badge) => (
            <button
              key={badge.id}
              onClick={() => toggleChallenge(badge.id)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedChallenges.includes(badge.id)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {badge.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tone section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Update tone (optional)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {TONE_CARDS.map((tone) => (
            <button
              key={tone.id}
              onClick={() => selectTone(tone.id)}
              disabled={isLoading}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedTone === tone.id
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="font-medium">{tone.label}</div>
              {tone.description && (
                <div className={`text-sm mt-1 ${
                  selectedTone === tone.id
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {tone.description}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Additional feedback (optional)
        </h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={isLoading}
          placeholder="Tell us more about what you're looking for..."
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
          rows={3}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleApply}
          disabled={!hasChanges || isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Apply & Generate New'}
        </button>
      </div>
    </div>
  );
}
