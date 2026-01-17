'use client';

import { useState, useCallback } from 'react';
import { generateAffirmationBatchFO02 } from '../actions';
import { StepWelcome } from './step-welcome';
import { StepIntent } from './step-intent';
import { StepSwipeIntro } from './step-swipe-intro';
import { SwipePhase, type SwipeDirection } from './swipe-phase';
import { StepCheckpoint } from './step-checkpoint';
import { StepIllustrative } from './step-illustrative';
import { StepCompletion } from './step-completion';
import { GenerationLoading } from './generation-loading';

/**
 * FO-02 Onboarding state
 * Steps 0-10 guide user through the full onboarding flow
 *
 * Key difference from FO-01:
 * - Generates 10 affirmations per batch (not 100 upfront)
 * - Uses approved/skipped feedback to improve subsequent batches
 */
export interface OnboardingState {
  currentStep: number;  // 0-10
  name: string;
  intention: string;
  selectedTopics: string[];

  // Batch generation (different from FO-01)
  currentBatch: string[];           // Current 10 affirmations being shown
  currentBatchNumber: number;       // 1, 2, or 3 (which batch we're on)
  isGenerating: boolean;
  generationError: string | null;

  // Swipe state
  currentCardIndex: number;         // 0-9 within current batch
  approvedAffirmations: string[];   // All approved across all batches
  skippedAffirmations: string[];    // All skipped across all batches

  // Illustrative choices (same as FO-01)
  selectedBackground: string | null;
  notificationFrequency: number | null;
}

const initialState: OnboardingState = {
  currentStep: 0,
  name: '',
  intention: '',
  selectedTopics: [],
  currentBatch: [],
  currentBatchNumber: 0,
  isGenerating: false,
  generationError: null,
  currentCardIndex: 0,
  approvedAffirmations: [],
  skippedAffirmations: [],
  selectedBackground: null,
  notificationFrequency: null,
};

/**
 * Main state manager component for FO-02 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions
 * - Calls server action to generate batches of 10 affirmations with feedback
 * - No persistence - state resets on refresh
 *
 * Key difference from FO-01:
 * - Generates 10 affirmations per batch (3 batches total)
 * - Uses approved/skipped lists to improve each subsequent batch
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

  // Generate a batch of affirmations via server action
  const generateBatch = useCallback(async (batchNumber: 1 | 2 | 3, intentionOverride?: string) => {
    const effectiveIntention = intentionOverride || state.intention;

    if (!state.name || !effectiveIntention) {
      updateState({ generationError: 'Name and intention are required' });
      return;
    }

    updateState({
      isGenerating: true,
      generationError: null,
      currentBatchNumber: batchNumber,
    });

    try {
      const result = await generateAffirmationBatchFO02({
        name: state.name,
        intention: effectiveIntention,
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate affirmations';
      updateState({
        isGenerating: false,
        generationError: errorMessage,
      });
    }
  }, [state.name, state.intention, state.approvedAffirmations, state.skippedAffirmations, updateState]);

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
            // Generate batch 1 with topics as intention
            await generateBatch(1, topicsIntention);
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
              // Move to loading step and trigger batch 1 generation
              goToStep(4);
              await generateBatch(1);
            }}
            onIDontKnow={() => goToStep(3.2)}
          />
        );

      case 4:
        // Swipe intro - explain mechanics, show loading if still generating
        // If generating, show loading state
        if (state.isGenerating) {
          return (
            <GenerationLoading
              name={state.name}
              batchNumber={1}
              error={state.generationError}
              onRetry={() => generateBatch(1)}
            />
          );
        }

        // If error, show error state
        if (state.generationError) {
          return (
            <GenerationLoading
              name={state.name}
              batchNumber={1}
              error={state.generationError}
              onRetry={() => generateBatch(1)}
            />
          );
        }

        // Ready to swipe
        return (
          <StepSwipeIntro
            name={state.name}
            isLoading={state.currentBatch.length === 0}
            onStart={nextStep}
          />
        );

      case 5: {
        // Swipe through current batch
        const batchSize = 10;
        const cardIndexInBatch = state.currentCardIndex + 1; // 1-indexed for display

        // Check if in the middle of generating next batch (show loading)
        if (state.isGenerating) {
          return (
            <GenerationLoading
              name={state.name}
              batchNumber={state.currentBatchNumber as 1 | 2 | 3}
              error={state.generationError}
              onRetry={() => generateBatch(state.currentBatchNumber as 1 | 2 | 3)}
            />
          );
        }

        // Check if batch is complete (all cards swiped)
        if (!hasMoreInBatch()) {
          // Batch complete - show checkpoint screen
          const batchNumber = state.currentBatchNumber;

          return (
            <StepCheckpoint
              name={state.name}
              batchNumber={batchNumber}
              approvedCount={state.approvedAffirmations.length}
              onContinue={async () => {
                // After batch 3, always go to Step 7
                if (batchNumber >= 3) {
                  goToStep(7);
                  return;
                }

                // Generate next batch with feedback
                const nextBatchNumber = (batchNumber + 1) as 1 | 2 | 3;
                await generateBatch(nextBatchNumber);
              }}
              onFinish={() => {
                // Skip remaining batches, go to background selection (step 7)
                goToStep(7);
              }}
            />
          );
        }

        // Get current affirmation for this batch
        const currentAffirmation = getCurrentAffirmation();

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
            />
          </div>
        );
      }

      case 6:
      case 7:
      case 8:
      case 9:
        // Illustrative steps: Background (7), Notifications (8), Paywall (9)
        return (
          <StepIllustrative
            currentStep={state.currentStep}
            onContinue={nextStep}
          />
        );

      case 10:
        // Completion step
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
