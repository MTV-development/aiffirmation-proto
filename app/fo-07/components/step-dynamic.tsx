'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicInput } from './dynamic-input';
import { DynamicScreenResponse } from '../actions';

interface StepDynamicProps {
  screenData: DynamicScreenResponse | null;
  isLoading: boolean;
  error: string | null;
  screenNumber: number;
  onAnswer: (question: string, answer: { text: string; selectedChips: string[] }, shouldProceedToAffirmations: boolean) => void;
  onRetry: () => void;
}

/**
 * Dynamic detail-gathering step component for FO-07 onboarding.
 *
 * This is a pure presentational component that:
 * 1. Shows 'Thinking...' loading state when isLoading is true
 * 2. Renders DynamicInput with screen data from parent
 * 3. Handles error state with retry button
 * 4. On continue: calls onAnswer with the user's input and whether to proceed to affirmations
 *
 * Screen count logic (evaluated here, decision passed to parent):
 * - If screenNumber < 2: always show next screen
 * - If screenNumber >= 5: proceed to affirmations
 * - Otherwise: respect agent's readyForAffirmations
 *
 * Parent is responsible for:
 * - Fetching screen data
 * - Managing gatheringContext
 * - Showing heart animation
 * - Triggering affirmation generation
 */
export function StepDynamic({
  screenData,
  isLoading,
  error,
  screenNumber,
  onAnswer,
  onRetry,
}: StepDynamicProps) {
  const [inputValue, setInputValue] = useState({ text: '', selectedChips: [] as string[] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = () => {
    if (!screenData) return;

    setIsSubmitting(true);

    // Determine if we should proceed to affirmations based on screen count logic
    // Screen count logic:
    // - If screenNumber < 2: always show next screen (we need minimum 2 screens)
    // - If screenNumber >= 5: proceed to affirmations regardless (max 5 screens)
    // - Otherwise: respect agent's readyForAffirmations decision
    let shouldProceedToAffirmations = false;

    if (screenNumber < 2) {
      // Minimum 2 screens - continue to next screen
      shouldProceedToAffirmations = false;
    } else if (screenNumber >= 5) {
      // Maximum 5 screens - proceed to affirmations
      shouldProceedToAffirmations = true;
    } else {
      // Between 2-4 screens - respect agent's decision
      shouldProceedToAffirmations = screenData.readyForAffirmations;
    }

    // Pass question, answer, and decision to parent
    onAnswer(screenData.question, inputValue, shouldProceedToAffirmations);

    // Reset input for next screen
    setInputValue({ text: '', selectedChips: [] });
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16"
          >
            <p className="text-xl text-gray-600 dark:text-gray-400">Thinking...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-16"
          >
            <p className="text-lg text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={onRetry}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        ) : screenData ? (
          <motion.div
            key={`screen-${screenNumber}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DynamicInput
              reflectiveStatement={screenData.reflectiveStatement}
              question={screenData.question}
              initialChips={screenData.initialChips}
              expandedChips={screenData.expandedChips}
              value={inputValue}
              onChange={setInputValue}
              onContinue={handleContinue}
              isLoading={isSubmitting}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
