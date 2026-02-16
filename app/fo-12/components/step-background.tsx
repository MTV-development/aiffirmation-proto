'use client';

import { useState } from 'react';

export interface StepBackgroundProps {
  onContinue: () => void;
}

const BACKGROUND_OPTIONS = [
  { id: 'gradient-sunset', colors: 'from-orange-400 via-pink-500 to-purple-600', label: 'Sunset' },
  { id: 'gradient-ocean', colors: 'from-cyan-400 via-blue-500 to-blue-700', label: 'Ocean' },
  { id: 'gradient-forest', colors: 'from-green-400 via-emerald-500 to-teal-600', label: 'Forest' },
  { id: 'gradient-lavender', colors: 'from-purple-400 via-violet-500 to-indigo-600', label: 'Lavender' },
  { id: 'gradient-rose', colors: 'from-rose-400 via-pink-500 to-fuchsia-600', label: 'Rose' },
  { id: 'gradient-midnight', colors: 'from-slate-700 via-slate-800 to-slate-900', label: 'Midnight' },
];

/**
 * Background Selection (UI mockup)
 *
 * Displays a grid of gradient backgrounds for the user to choose from.
 * Selection is local state only - does not persist.
 */
export function StepBackground({ onContinue }: StepBackgroundProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200 text-center">
        Make your affirmations look beautiful
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Choose a background for your affirmations — you can always explore more later.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {BACKGROUND_OPTIONS.map((bg) => (
          <button
            key={bg.id}
            onClick={() => setSelected(bg.id)}
            className={`aspect-square rounded-xl bg-gradient-to-br ${bg.colors} transition-all duration-200 ${
              selected === bg.id
                ? 'ring-3 ring-purple-600 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 scale-95'
                : 'hover:scale-105'
            }`}
            aria-label={bg.label}
            aria-pressed={selected === bg.id}
          />
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
