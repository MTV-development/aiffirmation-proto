'use client';

import { useState, useCallback } from 'react';
import { generateAffirmationsFO01 } from '../actions';
import { StepWelcome } from './step-welcome';
import { StepIntent } from './step-intent';
import { StepSwipeIntro } from './step-swipe-intro';

/**
 * FO-01 Onboarding state
 * Steps 0-10 guide user through the full onboarding flow
 */
export interface OnboardingState {
  currentStep: number;  // 0-10
  name: string;
  intention: string;
  selectedTopics: string[];
  allAffirmations: string[];
  isGenerating: boolean;
  generationError: string | null;
  currentBatchIndex: number;
  currentCardIndex: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
  selectedBackground: string | null;
  notificationFrequency: number | null;
}

const initialState: OnboardingState = {
  currentStep: 0,
  name: '',
  intention: '',
  selectedTopics: [],
  allAffirmations: [],
  isGenerating: false,
  generationError: null,
  currentBatchIndex: 0,
  currentCardIndex: 0,
  approvedAffirmations: [],
  skippedAffirmations: [],
  selectedBackground: null,
  notificationFrequency: null,
};

/**
 * Main state manager component for FO-01 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions
 * - Calls server action after Step 3/3.2 to generate 100 affirmations
 * - No persistence - state resets on refresh
 */
export function FOExperience() {
  const [state, setState] = useState<OnboardingState>(initialState);

  // Update specific state fields
  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Navigate to a specific step
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 10) {
      updateState({ currentStep: step });
    }
  }, [updateState]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 10),
    }));
  }, []);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  // Set user name
  const setName = useCallback((name: string) => {
    updateState({ name });
  }, [updateState]);

  // Set user intention
  const setIntention = useCallback((intention: string) => {
    updateState({ intention });
  }, [updateState]);

  // Toggle topic selection
  const toggleTopic = useCallback((topic: string) => {
    setState((prev) => {
      const isSelected = prev.selectedTopics.includes(topic);
      return {
        ...prev,
        selectedTopics: isSelected
          ? prev.selectedTopics.filter((t) => t !== topic)
          : [...prev.selectedTopics, topic],
      };
    });
  }, []);

  // Generate affirmations via server action
  const generateAffirmations = useCallback(async () => {
    if (!state.name || !state.intention) {
      updateState({ generationError: 'Name and intention are required' });
      return;
    }

    updateState({ isGenerating: true, generationError: null });

    try {
      const result = await generateAffirmationsFO01({
        name: state.name,
        intention: state.intention,
      });

      if (result.error) {
        updateState({
          isGenerating: false,
          generationError: result.error,
        });
        return;
      }

      updateState({
        isGenerating: false,
        allAffirmations: result.affirmations,
        generationError: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate affirmations';
      updateState({
        isGenerating: false,
        generationError: errorMessage,
      });
    }
  }, [state.name, state.intention, updateState]);

  // Generate affirmations with explicit intention (for step 3.2 where intention comes from topics)
  const generateAffirmationsWithIntention = useCallback(async (intention: string) => {
    if (!state.name || !intention) {
      updateState({ generationError: 'Name and intention are required' });
      return;
    }

    updateState({ isGenerating: true, generationError: null });

    try {
      const result = await generateAffirmationsFO01({
        name: state.name,
        intention: intention,
      });

      if (result.error) {
        updateState({
          isGenerating: false,
          generationError: result.error,
        });
        return;
      }

      updateState({
        isGenerating: false,
        allAffirmations: result.affirmations,
        generationError: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate affirmations';
      updateState({
        isGenerating: false,
        generationError: errorMessage,
      });
    }
  }, [state.name, updateState]);

  // Approve current affirmation
  const approveAffirmation = useCallback((affirmation: string) => {
    setState((prev) => ({
      ...prev,
      approvedAffirmations: [...prev.approvedAffirmations, affirmation],
      currentCardIndex: prev.currentCardIndex + 1,
    }));
  }, []);

  // Skip current affirmation
  const skipAffirmation = useCallback((affirmation: string) => {
    setState((prev) => ({
      ...prev,
      skippedAffirmations: [...prev.skippedAffirmations, affirmation],
      currentCardIndex: prev.currentCardIndex + 1,
    }));
  }, []);

  // Move to next batch of affirmations
  const nextBatch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentBatchIndex: prev.currentBatchIndex + 1,
      currentCardIndex: 0,
    }));
  }, []);

  // Set selected background
  const setSelectedBackground = useCallback((background: string | null) => {
    updateState({ selectedBackground: background });
  }, [updateState]);

  // Set notification frequency
  const setNotificationFrequency = useCallback((frequency: number | null) => {
    updateState({ notificationFrequency: frequency });
  }, [updateState]);

  // Reset to initial state
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Get current affirmation based on batch and card index
  const getCurrentAffirmation = useCallback((): string | null => {
    const batchSize = 10;
    const startIndex = state.currentBatchIndex * batchSize;
    const affirmationIndex = startIndex + state.currentCardIndex;
    return state.allAffirmations[affirmationIndex] ?? null;
  }, [state.allAffirmations, state.currentBatchIndex, state.currentCardIndex]);

  // Check if we have more affirmations in current batch
  const hasMoreInBatch = useCallback((): boolean => {
    const batchSize = 10;
    const startIndex = state.currentBatchIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, state.allAffirmations.length);
    const currentIndex = startIndex + state.currentCardIndex;
    return currentIndex < endIndex;
  }, [state.allAffirmations.length, state.currentBatchIndex, state.currentCardIndex]);

  // Check if we have more batches
  const hasMoreBatches = useCallback((): boolean => {
    const batchSize = 10;
    const nextBatchStart = (state.currentBatchIndex + 1) * batchSize;
    return nextBatchStart < state.allAffirmations.length;
  }, [state.allAffirmations.length, state.currentBatchIndex]);

  // Render step content based on current step
  const renderStep = () => {
    // Handle step 3.2 (inspiration topics) - fractional step from "I don't know"
    if (state.currentStep === 3.2) {
      return (
        <StepIntent
          currentStep={3.2}
          name={state.name}
          intention={state.intention}
          selectedTopics={state.selectedTopics}
          onIntentionChange={setIntention}
          onTopicsChange={(topics) => updateState({ selectedTopics: topics })}
          onContinue={async () => {
            // Build intention from selected topics for AI generation
            const topicsIntention = state.selectedTopics.join(', ');
            updateState({ intention: topicsIntention });
            goToStep(4);
            // Need to call generateAffirmations after state update
            // We'll rely on the updated intention in generateAffirmations
            await generateAffirmationsWithIntention(topicsIntention);
          }}
          onIDontKnow={() => goToStep(3)}
        />
      );
    }

    switch (state.currentStep) {
      case 0:
      case 1:
      case 2:
        // Welcome steps (0-2) handled by StepWelcome component
        return (
          <StepWelcome
            currentStep={state.currentStep}
            name={state.name}
            onNameChange={setName}
            onContinue={nextStep}
          />
        );

      case 3:
        // Open text intention step
        return (
          <StepIntent
            currentStep={3}
            name={state.name}
            intention={state.intention}
            selectedTopics={state.selectedTopics}
            onIntentionChange={setIntention}
            onTopicsChange={(topics) => updateState({ selectedTopics: topics })}
            onContinue={async () => {
              // Trigger AI generation and move to loading step
              goToStep(4);
              await generateAffirmations();
            }}
            onIDontKnow={() => goToStep(3.2)}
          />
        );

      case 4:
        // Swipe intro - explain mechanics, show loading if still generating
        if (state.generationError) {
          return (
            <div className="max-w-md mx-auto p-8 text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{state.generationError}</p>
              </div>
              <button
                onClick={() => {
                  updateState({ generationError: null });
                  prevStep();
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          );
        }
        return (
          <StepSwipeIntro
            name={state.name}
            isLoading={state.isGenerating || state.allAffirmations.length === 0}
            onStart={nextStep}
          />
        );

      case 5:
        // Swipe through affirmations
        const currentAffirmation = getCurrentAffirmation();
        if (!currentAffirmation && !hasMoreInBatch()) {
          // Batch complete - show summary or move to next batch
          return (
            <div className="max-w-md mx-auto p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Batch Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You&apos;ve approved {state.approvedAffirmations.length} affirmations so far.
              </p>
              <div className="flex justify-center gap-4">
                {hasMoreBatches() && (
                  <button
                    onClick={nextBatch}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    See More
                  </button>
                )}
                <button
                  onClick={nextStep}
                  disabled={state.approvedAffirmations.length === 0}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-md mx-auto p-8">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-2">
                {state.approvedAffirmations.length} saved
              </p>
            </div>
            {currentAffirmation && (
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center mb-8 shadow-xl">
                <p className="text-xl font-medium">{currentAffirmation}</p>
              </div>
            )}
            <div className="flex justify-center gap-8">
              <button
                onClick={() => currentAffirmation && skipAffirmation(currentAffirmation)}
                className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Skip"
              >
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={() => currentAffirmation && approveAffirmation(currentAffirmation)}
                className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-700 transition-colors"
                title="Save"
              >
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        );

      case 6:
        // Background selection
        return (
          <div className="max-w-md mx-auto p-8">
            <h2 className="text-2xl font-bold mb-4">Choose a background</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a visual style for your affirmations.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {['gradient-purple', 'gradient-blue', 'gradient-green', 'dark'].map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedBackground(bg)}
                  className={`h-24 rounded-lg border-2 transition-colors ${
                    state.selectedBackground === bg
                      ? 'border-purple-600'
                      : 'border-gray-300 dark:border-gray-600'
                  } ${
                    bg === 'gradient-purple' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                    bg === 'gradient-blue' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                    bg === 'gradient-green' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                    'bg-gray-900'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 7:
        // Notification frequency
        return (
          <div className="max-w-md mx-auto p-8">
            <h2 className="text-2xl font-bold mb-4">How often?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              How many times per day would you like to see affirmations?
            </p>
            <div className="space-y-3 mb-6">
              {[1, 3, 5, 10].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setNotificationFrequency(freq)}
                  className={`w-full px-4 py-3 rounded-lg border text-left transition-colors ${
                    state.notificationFrequency === freq
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                  }`}
                >
                  {freq}x per day
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 8:
      case 9:
        // Placeholder for additional steps
        return (
          <div className="max-w-md mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Step {state.currentStep}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This step will be implemented in a future task.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 10:
        // Completion step
        return (
          <div className="max-w-md mx-auto p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">All Set!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You&apos;ve saved {state.approvedAffirmations.length} personalized affirmations.
            </p>
            {state.approvedAffirmations.length > 0 && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left max-h-48 overflow-y-auto">
                <ul className="space-y-2">
                  {state.approvedAffirmations.map((aff, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>{aff}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={reset}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      {/* Progress indicator for steps 1-9 */}
      {state.currentStep > 0 && state.currentStep < 10 && (
        <div className="w-full max-w-md px-8 pt-8">
          <div className="flex gap-1">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < state.currentStep ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center w-full">
        {renderStep()}
      </div>
    </div>
  );
}
