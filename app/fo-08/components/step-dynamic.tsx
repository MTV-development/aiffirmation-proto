'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FragmentInput } from './fragment-input';
import {
  generateFirstScreenFragments,
  generateDynamicScreen,
} from '../actions';
import {
  GatheringContext,
  DynamicScreenResponse,
  FirstScreenFragmentsResponse,
  FIXED_OPENING_QUESTION,
} from '../types';

interface StepDynamicProps {
  gatheringContext: GatheringContext;
  onAnswer: (question: string, answer: { text: string }) => void;
  onReadyForAffirmations: () => void;
  onError: (error: string) => void;
}

/**
 * Dynamic detail-gathering step component for FO-08 onboarding.
 *
 * This component:
 * 1. Shows 'Thinking...' loading state while fetching fragments/screen
 * 2. Screen 1: Uses fixed opening question + generateFirstScreenFragments
 * 3. Screens 2+: Calls generateDynamicScreen server action
 * 4. Renders FragmentInput with question and optional reflectiveStatement
 * 5. Handles error state with retry button
 * 6. On continue: stores answer in exchanges, fetches next screen or transitions to affirmation phase
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
  const [screenData, setScreenData] = useState<{
    reflectiveStatement?: string;
    question: string;
    initialFragments: string[];
    expandedFragments: string[];
    readyForAffirmations: boolean;
  } | null>(null);
  const [inputValue, setInputValue] = useState({ text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use refs to store callbacks to prevent them from causing dependency changes
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onReadyForAffirmationsRef = useRef(onReadyForAffirmations);
  onReadyForAffirmationsRef.current = onReadyForAffirmations;

  // Track which screenNumber we've already fetched for to prevent duplicate fetches
  const fetchedScreenRef = useRef<number | null>(null);

  const fetchScreen = useCallback(async () => {
    // Prevent re-fetching the same screen
    if (fetchedScreenRef.current === gatheringContext.screenNumber) {
      return;
    }
    fetchedScreenRef.current = gatheringContext.screenNumber;

    setLoading(true);
    setError(null);

    try {
      if (gatheringContext.screenNumber === 1) {
        // Screen 1: Use fixed opening question + generateFirstScreenFragments
        const response: FirstScreenFragmentsResponse = await generateFirstScreenFragments(
          gatheringContext.name
        );

        if (response.error) {
          setError(response.error);
          onErrorRef.current(response.error);
        } else {
          setScreenData({
            // Screen 1 has no reflectiveStatement
            question: FIXED_OPENING_QUESTION,
            initialFragments: response.initialFragments,
            expandedFragments: response.expandedFragments,
            readyForAffirmations: false, // Screen 1 never ready for affirmations
          });
          // Reset input value for new screen
          setInputValue({ text: '' });
        }
      } else {
        // Screens 2+: Use generateDynamicScreen
        const response: DynamicScreenResponse = await generateDynamicScreen(gatheringContext);

        if (response.error) {
          setError(response.error);
          onErrorRef.current(response.error);
        } else {
          // Check if AI signals ready for affirmations (and we're past minimum screens)
          // If so, transition immediately without showing another input screen
          if (response.readyForAffirmations && gatheringContext.screenNumber >= 2) {
            onReadyForAffirmationsRef.current();
            return; // Don't set screenData - we're transitioning away
          }

          setScreenData({
            reflectiveStatement: response.reflectiveStatement,
            question: response.question,
            initialFragments: response.initialFragments,
            expandedFragments: response.expandedFragments,
            readyForAffirmations: response.readyForAffirmations,
          });
          // Reset input value for new screen
          setInputValue({ text: '' });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load screen';
      setError(errorMessage);
      onErrorRef.current(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gatheringContext]);

  // Fetch screen on mount and when context changes
  useEffect(() => {
    fetchScreen();
  }, [fetchScreen]);

  const handleContinue = async () => {
    if (!screenData) return;

    setIsSubmitting(true);

    // Trigger confetti on each screen completion
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    // Store the question and answer together
    // FO-08 uses simpler answer format: { text: string }
    onAnswer(screenData.question, { text: inputValue.text });

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
    // Reset the fetched screen ref to allow re-fetching
    fetchedScreenRef.current = null;
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
            <FragmentInput
              reflectiveStatement={screenData.reflectiveStatement}
              question={screenData.question}
              initialFragments={screenData.initialFragments}
              expandedFragments={screenData.expandedFragments}
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
