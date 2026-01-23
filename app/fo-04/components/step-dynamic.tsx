'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicInput } from './dynamic-input';
import {
  generateDynamicScreen,
  GatheringContext,
  DynamicScreenResponse,
} from '../actions';

interface StepDynamicProps {
  gatheringContext: GatheringContext;
  onAnswer: (answer: { text: string; selectedChips: string[] }) => void;
  onReadyForAffirmations: () => void;
  onError: (error: string) => void;
}

/**
 * Dynamic detail-gathering step component for FO-04 onboarding.
 *
 * This component:
 * 1. Shows 'Thinking...' loading state while fetching next screen
 * 2. Calls generateDynamicScreen server action
 * 3. Renders DynamicInput with agent response
 * 4. Handles error state with retry button
 * 5. On continue: stores answer in exchanges, fetches next screen or transitions to affirmation phase
 *
 * Screen count logic:
 * - If screenNumber < 2: always show next screen
 * - If screenNumber >= 5: proceed to affirmations
 * - Otherwise: respect agent's readyForAffirmations
 */
export function StepDynamic({
  gatheringContext,
  onAnswer,
  onReadyForAffirmations,
  onError,
}: StepDynamicProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screenData, setScreenData] = useState<DynamicScreenResponse | null>(null);
  const [inputValue, setInputValue] = useState({ text: '', selectedChips: [] as string[] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchScreen = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await generateDynamicScreen(gatheringContext);

      if (response.error) {
        setError(response.error);
        onError(response.error);
      } else {
        setScreenData(response);
        // Reset input value for new screen
        setInputValue({ text: '', selectedChips: [] });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load screen';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gatheringContext, onError]);

  // Fetch screen on mount and when context changes
  useEffect(() => {
    fetchScreen();
  }, [fetchScreen]);

  const handleContinue = async () => {
    if (!screenData) return;

    setIsSubmitting(true);

    // Store the answer
    onAnswer(inputValue);

    // Determine if we should proceed to affirmations based on screen count logic
    const nextScreenNumber = gatheringContext.screenNumber + 1;

    // Screen count logic:
    // - If screenNumber < 2: always show next screen (we need minimum 2 screens)
    // - If screenNumber >= 5: proceed to affirmations regardless (max 5 screens)
    // - Otherwise: respect agent's readyForAffirmations decision
    let shouldProceedToAffirmations = false;

    if (gatheringContext.screenNumber < 2) {
      // Minimum 2 screens - continue to next screen
      shouldProceedToAffirmations = false;
    } else if (gatheringContext.screenNumber >= 5) {
      // Maximum 5 screens - proceed to affirmations
      shouldProceedToAffirmations = true;
    } else {
      // Between 2-4 screens - respect agent's decision
      shouldProceedToAffirmations = screenData.readyForAffirmations;
    }

    if (shouldProceedToAffirmations) {
      onReadyForAffirmations();
    }
    // Note: If not proceeding to affirmations, the parent component will
    // update gatheringContext with the new exchange and screenNumber,
    // which will trigger a re-fetch via the useEffect dependency

    setIsSubmitting(false);
  };

  const handleRetry = () => {
    fetchScreen();
  };

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <AnimatePresence mode="wait">
        {loading ? (
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
              onClick={handleRetry}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Try again
            </button>
          </motion.div>
        ) : screenData ? (
          <motion.div
            key={`screen-${gatheringContext.screenNumber}`}
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
