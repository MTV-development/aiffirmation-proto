'use client';

import { motion } from 'framer-motion';

interface StepStartProps {
  onContinue: () => void;
  name: string;
}

/**
 * Start screen (Step 6) for FO-12 onboarding.
 *
 * Static motivational screen displayed after affirmations have been generated
 * during the heart animation. Communicates that the user is held and guided,
 * this is personal, something meaningful is about to happen, the user has
 * agency, and the affirmations are created for them.
 *
 * Tone: calm, affirming, personal.
 */
export function StepStart({ onContinue, name }: StepStartProps) {
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
          Based on what you&apos;ve shared, 10 affirmations are ready for you.
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Choose the ones that feel right for you — the ones you can actually say to yourself.
        </p>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your feedback helps us refine your next set.
          Now, let&apos;s create affirmations that truly support you.
        </p>

        <button
          onClick={onContinue}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Let&apos;s Begin
        </button>
      </motion.div>
    </div>
  );
}
