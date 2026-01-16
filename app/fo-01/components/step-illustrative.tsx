'use client';

import { useState } from 'react';

export interface StepIllustrativeProps {
  currentStep: number;  // 6, 7, 8, or 9
  onContinue: () => void;
}

// Background options for step 7
const BACKGROUND_OPTIONS = [
  { id: 'gradient-sunset', colors: 'from-orange-400 via-pink-500 to-purple-600', label: 'Sunset' },
  { id: 'gradient-ocean', colors: 'from-cyan-400 via-blue-500 to-blue-700', label: 'Ocean' },
  { id: 'gradient-forest', colors: 'from-green-400 via-emerald-500 to-teal-600', label: 'Forest' },
  { id: 'gradient-lavender', colors: 'from-purple-400 via-violet-500 to-indigo-600', label: 'Lavender' },
  { id: 'gradient-rose', colors: 'from-rose-400 via-pink-500 to-fuchsia-600', label: 'Rose' },
  { id: 'gradient-midnight', colors: 'from-slate-700 via-slate-800 to-slate-900', label: 'Midnight' },
  { id: 'gradient-dawn', colors: 'from-amber-300 via-orange-400 to-rose-500', label: 'Dawn' },
  { id: 'gradient-calm', colors: 'from-sky-300 via-blue-400 to-indigo-500', label: 'Calm' },
  { id: 'gradient-nature', colors: 'from-lime-400 via-green-500 to-emerald-600', label: 'Nature' },
];

// Notification frequency options for step 8
const FREQUENCY_OPTIONS = [
  { value: 1, label: '1x daily', description: 'One gentle reminder each day' },
  { value: 3, label: '3x daily', description: 'Morning, afternoon, and evening' },
  { value: 5, label: '5x daily', description: 'Regular moments of positivity' },
  { value: 0, label: 'None', description: 'I\'ll open the app on my own' },
];

/**
 * Step 7: Background Selection
 */
function StepBackground({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200 text-center">
        Make your affirmations look beautiful ✨
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

/**
 * Step 8: Notification Frequency
 */
function StepNotifications({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200 text-center">
        Set up reminders with your personal affirmations 💛
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

/**
 * Step 9: Light Paywall
 */
function StepPaywall({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200 text-center">
        More support, whenever you want 🌿
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Get 3 days free of premium. With Premium, you can create hundreds of lists and expand
        your personal list with 100s of affirmations.
      </p>

      <div className="space-y-3">
        <button
          onClick={onContinue}
          className="w-full px-8 py-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          Try free for 3 days
        </button>
        <button
          onClick={onContinue}
          className="w-full px-8 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

/**
 * Illustrative steps component for steps 6-9.
 *
 * These are UI-only with no backend integration.
 * - Step 6/7: Background selection (9 gradient options)
 * - Step 8: Notification frequency (1x, 3x, 5x, None)
 * - Step 9: Light paywall (Try free / Not now)
 *
 * Note: Step 6 maps to Background as a fallback in case checkpoint
 * flow doesn't skip directly to step 7.
 */
export function StepIllustrative({ currentStep, onContinue }: StepIllustrativeProps) {
  switch (currentStep) {
    case 6:
    case 7:
      return <StepBackground onContinue={onContinue} />;
    case 8:
      return <StepNotifications onContinue={onContinue} />;
    case 9:
      return <StepPaywall onContinue={onContinue} />;
    default:
      return null;
  }
}
