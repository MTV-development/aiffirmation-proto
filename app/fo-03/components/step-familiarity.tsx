'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

type FamiliarityLevel = 'new' | 'some' | 'very';

interface StepFamiliarityProps {
  currentStep: number;
  name: string;
  familiarity: FamiliarityLevel | null;
  onFamiliarityChange: (familiarity: FamiliarityLevel) => void;
  onContinue: () => void;
}

const FAMILIARITY_OPTIONS: { value: FamiliarityLevel; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'some', label: 'Some experience' },
  { value: 'very', label: 'Very familiar' },
];

/**
 * Familiarity step (Step 3) for FO-03 onboarding
 *
 * Shows three button options for familiarity level.
 * On selection: triggers confetti, shows success message, auto-advances after delay.
 */
export function StepFamiliarity({
  currentStep,
  name,
  onFamiliarityChange,
  onContinue,
}: StepFamiliarityProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  if (currentStep !== 3) return null;

  const handleSelection = (level: FamiliarityLevel) => {
    onFamiliarityChange(level);
    setShowSuccess(true);

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Auto-advance after showing success message
    setTimeout(() => {
      onContinue();
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-2xl font-medium mb-8 text-gray-800 dark:text-gray-200">
              How familiar are you with affirmations, {name}?
            </h2>
            <div className="flex flex-col gap-3">
              {FAMILIARITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelection(option.value)}
                  className="w-full px-6 py-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8"
          >
            <p className="text-2xl font-medium text-gray-800 dark:text-gray-200">
              Super, {name}!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
