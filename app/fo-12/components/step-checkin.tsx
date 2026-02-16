'use client';

import { motion } from 'framer-motion';

interface StepCheckinProps {
  phase: 1 | 2;
  onContinue: () => void;
  isLoading: boolean;
}

const CHECKIN_CONTENT = {
  1: {
    headline: 'Thank you for going through the first affirmations.',
    body: [
      "Based on your selections, we've refined your affirmations to support you even more deeply.",
      'Here are 10 new affirmations — shaped by what resonated with you.',
    ],
    bullets: [
      'Take your time.',
      'Notice what feels true.',
      'Keep building what supports you.',
    ],
  },
  2: {
    headline: "You're almost there.",
    body: [
      "You've already shaped your affirmations beautifully.",
      "To create your personal set, we'll now show affirmations in order to get 30 affirmations that resonate with you.",
    ],
    closingLines: [
      'Take your time.',
      'Choose what feels strong, steady, and believable.',
      "You're building something that is truly yours.",
    ],
  },
} as const;

/**
 * Check-in screen for FO-12 (Steps 8 and 10).
 *
 * Parameterized component used for both check-in 1 (after phase 1) and
 * check-in 2 (after phase 2). Content varies by phase prop.
 *
 * When isLoading is true, shows a loading/thinking screen instead of
 * the Continue button (generation is happening in the background).
 *
 * Tone: calm, affirming, supportive. Not overly enthusiastic.
 */
export function StepCheckin({ phase, onContinue, isLoading }: StepCheckinProps) {
  const content = CHECKIN_CONTENT[phase];

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-medium mb-6 text-gray-800 dark:text-gray-200">
          {content.headline}
        </h2>

        <div className="text-gray-600 dark:text-gray-400 mb-6 space-y-4">
          {content.body.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Phase 1: bullet list */}
        {phase === 1 && (
          <ul className="text-left text-gray-600 dark:text-gray-400 mb-8 space-y-2 max-w-xs mx-auto">
            {CHECKIN_CONTENT[1].bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">&#x2022;</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Phase 2: closing lines */}
        {phase === 2 && (
          <div className="text-gray-600 dark:text-gray-400 mb-8 space-y-1">
            {CHECKIN_CONTENT[2].closingLines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Creating your next affirmations...
            </p>
          </div>
        ) : (
          <button
            onClick={onContinue}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Continue
          </button>
        )}
      </motion.div>
    </div>
  );
}
