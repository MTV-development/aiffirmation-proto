'use client';

import { useState } from 'react';

export interface StepNotificationsProps {
  onContinue: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 1, label: '1x daily', description: 'One gentle reminder each day' },
  { value: 2, label: '2x daily', description: 'Morning and evening' },
  { value: 3, label: '3x daily', description: 'Morning, afternoon, and evening' },
  { value: 5, label: '5x daily', description: 'Regular moments of positivity' },
];

/**
 * Notification Frequency (UI mockup)
 *
 * Allows user to select how often they want affirmation reminders.
 * Selection is local state only - does not persist.
 */
export function StepNotifications({ onContinue }: StepNotificationsProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200 text-center">
        Set up reminders with your personal affirmations
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
        Affirmations work best when they gently meet you again and again.
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-6 text-center font-medium">
        How many times a day would you like one sent to you?
      </p>

      <div className="space-y-3 mb-8">
        {FREQUENCY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelected(option.value)}
            className={`w-full px-4 py-4 rounded-xl border-2 text-left transition-all duration-200 ${
              selected === option.value
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500'
            }`}
          >
            <div className="font-medium text-gray-800 dark:text-gray-200">
              {option.label}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {option.description}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
