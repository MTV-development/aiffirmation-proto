'use client';

import { useState, useCallback } from 'react';
import {
  generateAffirmationBatchFO05,
  GatheringContext,
} from '../actions';
import { StepWelcome } from './step-welcome';
import { StepFamiliarity } from './step-familiarity';
import { StepTopics } from './step-topics';
import { HeartAnimation } from './heart-animation';
import { StepDynamic } from './step-dynamic';
import { SwipePhase, type SwipeDirection } from './swipe-phase';
import { StepCheckpoint } from './step-checkpoint';
import { StepBackground } from './step-background';
import { StepNotifications } from './step-notifications';
import { StepPaywall } from './step-paywall';
import { StepCompletion } from './step-completion';

/**
 * FO-05 Onboarding data collected during the flow.
 * Key difference from FO-04: uses selectedFragments instead of selectedChips in exchanges.
 */
export interface FO05OnboardingData {
  name: string;
  familiarity: 'new' | 'some' | 'very' | null;
  topics: string[];
  gatheringContext: GatheringContext;
}

/**
 * FO-05 Onboarding state
 *
 * Flow phases:
 * - Steps 0-2: Welcome screens (same as FO-04)
 * - Step 3: Familiarity selection
 * - Step 4: Topic selection
 * - Step 5: Dynamic gathering screens (2-5 AI-generated screens)
 * - Step 6: Heart animation transition to swipe phase
 * - Steps 7-8: Swipe phase with batch generation
 * - Steps 9-11: Post-swipe mockups (background, notifications, paywall)
 * - Step 12: Completion screen
 *
 * Key differences from FO-04:
 * - Uses FragmentInput with initialFragments/expandedFragments instead of chips
 * - Exchanges use selectedFragments (which will be empty since fragments are embedded in text)
 */
export interface OnboardingState extends FO05OnboardingData {
  currentStep: number; // 0-12

  // Heart animation transition state
  showHeartAnimation: boolean;

  // Dynamic gathering screen state
  dynamicScreenNumber: number; // 1-indexed, tracks position in dynamic phase (1-5)

  // Batch generation
  currentBatch: string[];
  currentBatchNumber: number;
  isGenerating: boolean;
  generationError: string | null;

  // Swipe state
  currentCardIndex: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
  hasSwipedOnce: boolean;

  // Illustrative choices
  selectedBackground: string | null;
  notificationFrequency: number | null;
}

const initialState: OnboardingState = {
  currentStep: 0,
  name: '',
  familiarity: null,
  topics: [],
  gatheringContext: {
    name: '',
    familiarity: 'new',
    initialTopic: '',
    exchanges: [],
    screenNumber: 1,
  },
  showHeartAnimation: false,
  dynamicScreenNumber: 1,
  currentBatch: [],
  currentBatchNumber: 0,
  isGenerating: false,
  generationError: null,
  currentCardIndex: 0,
  approvedAffirmations: [],
  skippedAffirmations: [],
  hasSwipedOnce: false,
  selectedBackground: null,
  notificationFrequency: null,
};

/**
 * Main state manager component for FO-05 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions
 * - Orchestrates dynamic gathering phase with AI-generated screens
 * - Calls server action to generate batches of affirmations with feedback
 * - No persistence - state resets on refresh
 *
 * Key differences from FO-04:
 * - Uses FragmentInput with initialFragments/expandedFragments
 * - Exchanges use selectedFragments (empty array since fragments are in text)
 */
export function FOExperience() {
  const [state, setState] = useState<OnboardingState>(initialState);

  // Update specific state fields
  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Navigate to a specific step
  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step <= 12) {
        updateState({ currentStep: step });
      }
    },
    [updateState]
  );

  // Navigate to next step
  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 12),
    }));
  }, []);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  // Handle topic selection - initialize gathering context
  const handleTopicsComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 5,
      gatheringContext: {
        name: prev.name,
        familiarity: prev.familiarity ?? 'new',
        initialTopic: prev.topics.join(', ') || 'general wellbeing',
        exchanges: [],
        screenNumber: 1,
      },
      dynamicScreenNumber: 1,
    }));
  }, []);

  // Handle storing the question from step-dynamic with the answer
  // FO-05 uses selectedFragments (empty array since fragments are embedded in text)
  const handleDynamicQuestionReceived = useCallback(
    (question: string, answer: { text: string; selectedFragments: string[] }) => {
      setState((prev) => ({
        ...prev,
        gatheringContext: {
          ...prev.gatheringContext,
          exchanges: [
            ...prev.gatheringContext.exchanges,
            { question, answer },
          ],
          screenNumber: prev.dynamicScreenNumber + 1,
        },
        dynamicScreenNumber: prev.dynamicScreenNumber + 1,
      }));
    },
    []
  );

  // Handle ready for affirmations - transition to heart animation then swipe
  const handleReadyForAffirmations = useCallback(() => {
    updateState({ showHeartAnimation: true });
  }, [updateState]);

  // Handle dynamic screen error
  const handleDynamicError = useCallback((error: string) => {
    console.error('[fo-05] Dynamic screen error:', error);
    // Error is displayed by step-dynamic, no additional action needed
  }, []);

  // Generate a batch of affirmations via server action
  const generateBatch = useCallback(
    async (batchNumber: 1 | 2 | 3) => {
      if (!state.name) {
        updateState({ generationError: 'Name is required' });
        return;
      }

      updateState({
        isGenerating: true,
        generationError: null,
        currentBatchNumber: batchNumber,
      });

      try {
        const result = await generateAffirmationBatchFO05({
          context: state.gatheringContext,
          batchNumber,
          approvedAffirmations: state.approvedAffirmations,
          skippedAffirmations: state.skippedAffirmations,
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
          currentBatch: result.affirmations,
          currentCardIndex: 0,
          generationError: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to generate affirmations';
        updateState({
          isGenerating: false,
          generationError: errorMessage,
        });
      }
    },
    [
      state.name,
      state.gatheringContext,
      state.approvedAffirmations,
      state.skippedAffirmations,
      updateState,
    ]
  );

  // Approve current affirmation
  const approveAffirmation = useCallback((affirmation: string) => {
    setState((prev) => ({
      ...prev,
      approvedAffirmations: [...prev.approvedAffirmations, affirmation],
      currentCardIndex: prev.currentCardIndex + 1,
      hasSwipedOnce: true,
    }));
  }, []);

  // Skip current affirmation
  const skipAffirmation = useCallback((affirmation: string) => {
    setState((prev) => ({
      ...prev,
      skippedAffirmations: [...prev.skippedAffirmations, affirmation],
      currentCardIndex: prev.currentCardIndex + 1,
      hasSwipedOnce: true,
    }));
  }, []);

  // Get current affirmation in the batch
  const getCurrentAffirmation = useCallback((): string | null => {
    return state.currentBatch[state.currentCardIndex] ?? null;
  }, [state.currentBatch, state.currentCardIndex]);

  // Check if we have more affirmations in current batch
  const hasMoreInBatch = useCallback((): boolean => {
    return state.currentCardIndex < state.currentBatch.length;
  }, [state.currentBatch.length, state.currentCardIndex]);

  // Render step content based on current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
      case 1:
      case 2:
        return (
          <StepWelcome
            currentStep={state.currentStep}
            name={state.name}
            onNameChange={(name) => updateState({ name })}
            onContinue={nextStep}
          />
        );

      case 3:
        return (
          <StepFamiliarity
            currentStep={state.currentStep}
            name={state.name}
            familiarity={state.familiarity}
            onFamiliarityChange={(familiarity) => updateState({ familiarity })}
            onContinue={nextStep}
          />
        );

      case 4:
        return (
          <StepTopics
            currentStep={state.currentStep}
            name={state.name}
            topics={state.topics}
            onTopicsChange={(topics) => updateState({ topics })}
            onContinue={handleTopicsComplete}
            onSkip={handleTopicsComplete}
          />
        );

      case 5:
        // Dynamic gathering screens (2-5 AI-generated screens)
        // Heart animation shows when transitioning to swipe phase
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message={`You have been doing great, ${state.name}! We are creating your personalized affirmations.`}
              onComplete={async () => {
                updateState({ showHeartAnimation: false });
                goToStep(7);
                await generateBatch(1);
              }}
            />
          );
        }
        return (
          <StepDynamic
            gatheringContext={state.gatheringContext}
            onAnswer={(question, answer) => {
              // Store both the question and answer in the exchange
              // FO-05 passes { text: string; selectedFragments: string[] }
              handleDynamicQuestionReceived(question, answer);
            }}
            onReadyForAffirmations={handleReadyForAffirmations}
            onError={handleDynamicError}
          />
        );

      case 6:
        // Unused - dynamic screens use step 5, this is kept for potential future use
        return null;

      case 7:
      case 8: {
        // Swipe phase - batch generation, swiping, and checkpoints
        const batchSize = 10;
        const cardIndexInBatch = state.currentCardIndex + 1; // 1-indexed for display

        // Show loading state during generation
        if (state.isGenerating) {
          return (
            <div className="flex flex-col h-full items-center justify-center p-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {state.currentBatchNumber === 1
                  ? `Creating your personal affirmations, ${state.name}...`
                  : `Preparing more affirmations just for you, ${state.name}...`}
              </p>
            </div>
          );
        }

        // Show error state
        if (state.generationError) {
          return (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center">
              <p className="text-red-500 mb-4">{state.generationError}</p>
              <button
                onClick={() => generateBatch(state.currentBatchNumber as 1 | 2 | 3)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          );
        }

        // Check if batch is complete (all cards swiped)
        if (!hasMoreInBatch() && state.currentBatch.length > 0) {
          const batchNumber = state.currentBatchNumber;

          // After batch 3, show transition screen
          if (batchNumber >= 3) {
            return (
              <StepCheckpoint
                name={state.name}
                variant="transition"
                onContinue={() => goToStep(9)}
              />
            );
          }

          // After batch 1, show batch1 checkpoint (Step 7)
          if (batchNumber === 1) {
            return (
              <StepCheckpoint
                name={state.name}
                variant="batch1"
                onContinue={async () => {
                  // Reset hasSwipedOnce for next batch messaging
                  updateState({ hasSwipedOnce: false });
                  await generateBatch(2);
                }}
                onFinish={() => {
                  // Show transition and proceed to Step 9
                  goToStep(8);
                  // Set state to show transition screen
                  updateState({
                    currentBatch: [],
                    currentBatchNumber: 4, // Signal we're done with batches
                  });
                }}
              />
            );
          }

          // After batch 2+, show subsequent checkpoint (Step 8)
          return (
            <StepCheckpoint
              name={state.name}
              variant="subsequent"
              onContinue={async () => {
                // Reset hasSwipedOnce for next batch messaging
                updateState({ hasSwipedOnce: false });
                await generateBatch(3);
              }}
              onFinish={() => {
                // Show transition screen
                updateState({
                  currentBatch: [],
                  currentBatchNumber: 4,
                });
              }}
            />
          );
        }

        // Show transition screen when user chose to finish early
        if (state.currentBatchNumber === 4) {
          return (
            <StepCheckpoint
              name={state.name}
              variant="transition"
              onContinue={() => goToStep(9)}
            />
          );
        }

        // Get current affirmation for swiping
        const currentAffirmation = getCurrentAffirmation();

        // Handle swipe action
        const handleSwipe = (direction: SwipeDirection, affirmation: string) => {
          if (direction === 'down') {
            // Down = keep (toward user)
            approveAffirmation(affirmation);
          } else {
            // Up = discard (away from user)
            skipAffirmation(affirmation);
          }
        };

        return (
          <div className="w-full max-w-md mx-auto h-[600px]">
            <SwipePhase
              affirmation={currentAffirmation ?? ''}
              index={cardIndexInBatch}
              total={batchSize}
              onSwipe={handleSwipe}
              isLoading={state.isGenerating}
              name={state.name}
              hasSwipedOnce={state.hasSwipedOnce}
            />
          </div>
        );
      }

      case 9:
        return <StepBackground onContinue={nextStep} />;

      case 10:
        return <StepNotifications onContinue={nextStep} />;

      case 11:
        return <StepPaywall onContinue={nextStep} />;

      case 12:
        return (
          <StepCompletion
            name={state.name}
            approvedAffirmations={state.approvedAffirmations}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      {/* Progress indicator for steps 1-11 */}
      {state.currentStep > 0 && state.currentStep < 12 && (
        <div className="w-full max-w-md px-8 pt-8">
          <div className="flex gap-1">
            {Array.from({ length: 11 }, (_, i) => (
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
