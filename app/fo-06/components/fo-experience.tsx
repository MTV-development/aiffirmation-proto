'use client';

import { useState, useCallback } from 'react';
import {
  generateAffirmationBatchFO06,
  generateCompletionSummary,
} from '../actions';
import { GatheringContext } from '../types';
import { StepWelcome } from './step-welcome';
import { StepFamiliarity } from './step-familiarity';
import { StepReady } from './step-ready';
import { StepDynamic } from './step-dynamic';
import { SwipePhase, type SwipeDirection } from './swipe-phase';
import { StepCheckpoint } from './step-checkpoint';
import { StepBackground } from './step-background';
import { StepNotifications } from './step-notifications';
import { StepPaywall } from './step-paywall';
import { StepCompletion } from './step-completion';

type FamiliarityLevel = 'new' | 'some' | 'very';

/**
 * FO-06 Onboarding data collected during the flow.
 */
export interface FO06OnboardingData {
  name: string;
  familiarity: FamiliarityLevel | null;
  gatheringContext: GatheringContext;
}

/**
 * FO-06 Onboarding state
 *
 * Flow phases:
 * - Steps 0-2: Welcome screens (same as FO-05)
 * - Step 3: Familiarity selection
 * - Steps 4-8: Dynamic investigation screens (2-5 AI-generated screens)
 * - Step 9: Ready screen (transition to affirmation generation)
 * - Steps 10-11: Swipe phase with batch generation
 * - Steps 12-14: Post-swipe mockups (background, notifications, paywall)
 * - Step 15: Completion screen
 *
 * Key differences from FO-05:
 * - No progress bar
 * - No topic selection (FO-05 step 4)
 * - Fixed opening question for discovery
 * - Three-part discovery: situation → problem → desired outcome
 */
export interface OnboardingState extends FO06OnboardingData {
  currentStep: number; // 0-15

  // Ready screen transition state
  showReadyScreen: boolean;

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

  // Completion summary
  completionSummary: string;
}

const initialState: OnboardingState = {
  currentStep: 0,
  name: '',
  familiarity: null,
  gatheringContext: {
    name: '',
    exchanges: [],
    screenNumber: 1,
  },
  showReadyScreen: false,
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
  completionSummary: '',
};

/**
 * Main state manager component for FO-06 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions
 * - Orchestrates dynamic gathering phase with AI-generated screens
 * - Calls server action to generate batches of affirmations with feedback
 * - No persistence - state resets on refresh
 *
 * Key differences from FO-05:
 * - NO progress bar
 * - No topic selection
 * - Fixed opening question + three-part discovery
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
      if (step >= 0 && step <= 15) {
        updateState({ currentStep: step });
      }
    },
    [updateState]
  );

  // Navigate to next step
  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 15),
    }));
  }, []);

  // Handle familiarity complete - initialize gathering context and go to first investigation screen
  const handleFamiliarityComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 4, // Go to first dynamic investigation screen
      gatheringContext: {
        name: prev.name,
        exchanges: [],
        screenNumber: 1,
      },
      dynamicScreenNumber: 1,
    }));
  }, []);

  // Handle storing the question from step-dynamic with the answer
  // FO-06 uses simpler answer format: { text: string }
  const handleDynamicQuestionReceived = useCallback(
    (question: string, answer: { text: string }) => {
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

  // Handle ready for affirmations - transition to ready screen
  const handleReadyForAffirmations = useCallback(() => {
    updateState({ showReadyScreen: true });
  }, [updateState]);

  // Handle dynamic screen error
  const handleDynamicError = useCallback((error: string) => {
    console.error('[fo-06] Dynamic screen error:', error);
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
        const result = await generateAffirmationBatchFO06({
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
        // Welcome screens (same as FO-05)
        return (
          <StepWelcome
            currentStep={state.currentStep}
            name={state.name}
            onNameChange={(name) => updateState({ name })}
            onContinue={nextStep}
          />
        );

      case 3:
        // Familiarity selection
        return (
          <StepFamiliarity
            currentStep={state.currentStep}
            name={state.name}
            familiarity={state.familiarity}
            onFamiliarityChange={(familiarity) => updateState({ familiarity })}
            onContinue={handleFamiliarityComplete}
          />
        );

      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        // Dynamic investigation screens (steps 4-8)
        // Ready screen shows when transitioning to swipe phase
        if (state.showReadyScreen) {
          return (
            <StepReady
              name={state.name}
              gatheringContext={state.gatheringContext}
              onContinue={async () => {
                updateState({ showReadyScreen: false });
                goToStep(10);
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
              // FO-06 passes { text: string }
              handleDynamicQuestionReceived(question, answer);
            }}
            onReadyForAffirmations={handleReadyForAffirmations}
            onError={handleDynamicError}
          />
        );

      case 9:
        // Ready screen (if not shown during dynamic phase)
        return (
          <StepReady
            name={state.name}
            gatheringContext={state.gatheringContext}
            onContinue={async () => {
              goToStep(10);
              await generateBatch(1);
            }}
          />
        );

      case 10:
      case 11: {
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
                onContinue={() => goToStep(12)}
              />
            );
          }

          // After batch 1, show batch1 checkpoint (Step 10)
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
                  // Show transition and proceed to Step 12
                  goToStep(11);
                  // Set state to show transition screen
                  updateState({
                    currentBatch: [],
                    currentBatchNumber: 4, // Signal we're done with batches
                  });
                }}
              />
            );
          }

          // After batch 2+, show subsequent checkpoint (Step 11)
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
              onContinue={() => goToStep(12)}
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

      case 12:
        return <StepBackground onContinue={nextStep} />;

      case 13:
        return <StepNotifications onContinue={nextStep} />;

      case 14:
        return (
          <StepPaywall
            onContinue={async () => {
              // Move to completion step
              nextStep();
              // Generate post-affirmation summary for completion screen
              const summary = await generateCompletionSummary(state.gatheringContext);
              updateState({ completionSummary: summary });
            }}
          />
        );

      case 15:
        return (
          <StepCompletion
            name={state.name}
            approvedAffirmations={state.approvedAffirmations}
            summary={state.completionSummary}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      {/* NO PROGRESS BAR - removed for FO-06 */}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center w-full">
        {renderStep()}
      </div>
    </div>
  );
}
