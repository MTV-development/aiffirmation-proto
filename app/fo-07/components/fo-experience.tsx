'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  generateAffirmations,
  generateReviewSummary,
  generateDynamicScreen,
  GatheringContext,
  DynamicScreenResponse,
} from '../actions';
import { StepWelcome } from './step-welcome';
import { StepFamiliarity } from './step-familiarity';
import { StepTopics } from './step-topics';
import { HeartAnimation } from './heart-animation';
import { StepDynamic } from './step-dynamic';
import { AffirmationReview } from './affirmation-review';
import { StepBackground } from './step-background';
import { StepNotifications } from './step-notifications';
import { StepPaywall } from './step-paywall';
import { StepCompletion } from './step-completion';

/**
 * FO-07 Onboarding data collected during the flow.
 * Uses GatheringContext with dynamic exchanges and chip-based input (like FO-04).
 * Key difference from FO-04: No swipe phase, uses AffirmationReview instead.
 */
export interface FO07OnboardingData {
  name: string;
  familiarity: 'new' | 'some' | 'very' | null;
  topics: string[];
  gatheringContext: GatheringContext;
}

/**
 * FO-07 Onboarding state
 *
 * Flow phases:
 * - Steps 0-2: Welcome screens
 * - Step 3: Familiarity selection
 * - Step 4: Topic selection
 * - Step 5: Dynamic gathering screens (2-5 AI-generated screens) with heart animation transitions
 * - Step 6: Affirmation generation (loading state, generate all 20 at once)
 * - Step 7: AffirmationReview screen (replaces swipe phase)
 * - Steps 8-10: Post-review mockups (background, notifications, paywall)
 * - Step 11: Completion screen
 *
 * Key differences from FO-04:
 * - NO PROGRESS BAR
 * - No batch generation - generates all 20 affirmations at once
 * - AffirmationReview replaces swipe phase
 * - Heart animation after each dynamic screen
 */
export interface OnboardingState extends FO07OnboardingData {
  currentStep: number; // 0-11

  // Heart animation transition state
  showHeartAnimation: boolean;
  heartAnimationMessage: string;

  // Dynamic gathering screen state (parent-controlled fetching)
  dynamicScreenNumber: number; // 1-indexed, tracks position in dynamic phase (1-5)
  dynamicScreenData: DynamicScreenResponse | null;
  isDynamicLoading: boolean;
  dynamicError: string | null;
  needsDynamicFetch: boolean; // Flag to trigger fetch

  // Affirmation generation state
  isGenerating: boolean;
  generationError: string | null;
  allAffirmations: string[]; // All 20 generated affirmations
  reviewSummary: string;

  // After review
  likedAffirmations: string[];

  // Illustrative choices (mockup state)
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
  heartAnimationMessage: '',
  dynamicScreenNumber: 1,
  dynamicScreenData: null,
  isDynamicLoading: false,
  dynamicError: null,
  needsDynamicFetch: false,
  isGenerating: false,
  generationError: null,
  allAffirmations: [],
  reviewSummary: '',
  likedAffirmations: [],
  selectedBackground: null,
  notificationFrequency: null,
};

/**
 * Main state manager component for FO-07 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions
 * - Orchestrates dynamic gathering phase with AI-generated screens
 * - Generates all 20 affirmations at once (no batch loop)
 * - Shows AffirmationReview instead of swipe phase
 * - No persistence - state resets on refresh
 *
 * Key differences from FO-04:
 * - NO PROGRESS BAR
 * - Heart animation after each dynamic screen (not just before swipe)
 * - Generates 20 affirmations in one call
 * - AffirmationReview component for rating affirmations
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
      if (step >= 0 && step <= 11) {
        updateState({ currentStep: step });
      }
    },
    [updateState]
  );

  // Navigate to next step
  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 11),
    }));
  }, []);

  // Fetch dynamic screen - called by useEffect when needsDynamicFetch is true
  const fetchDynamicScreen = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isDynamicLoading: true,
      dynamicError: null,
      needsDynamicFetch: false, // Clear the flag
    }));

    try {
      const response = await generateDynamicScreen(state.gatheringContext);

      if (response.error) {
        setState((prev) => ({
          ...prev,
          isDynamicLoading: false,
          dynamicError: response.error || 'Unknown error',
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isDynamicLoading: false,
          dynamicScreenData: response,
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load screen';
      setState((prev) => ({
        ...prev,
        isDynamicLoading: false,
        dynamicError: errorMessage,
      }));
    }
  }, [state.gatheringContext]);

  // Trigger fetch when needsDynamicFetch flag is set
  useEffect(() => {
    if (state.needsDynamicFetch && state.currentStep === 5 && !state.showHeartAnimation) {
      fetchDynamicScreen();
    }
  }, [state.needsDynamicFetch, state.currentStep, state.showHeartAnimation, fetchDynamicScreen]);

  // Retry fetching dynamic screen
  const handleDynamicRetry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      needsDynamicFetch: true,
    }));
  }, []);

  // Handle topic selection - initialize gathering context and go to dynamic screens
  const handleTopicsComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 5,
      gatheringContext: {
        name: prev.name,
        familiarity: prev.familiarity || 'new',
        initialTopic: prev.topics.join(', ') || 'general wellbeing',
        exchanges: [],
        screenNumber: 1,
      },
      dynamicScreenNumber: 1,
      dynamicScreenData: null,
      isDynamicLoading: false,
      dynamicError: null,
      needsDynamicFetch: true, // Trigger fetch for first dynamic screen
    }));
  }, []);

  // Handle answer from step-dynamic (includes decision on whether to proceed to affirmations)
  const handleDynamicAnswer = useCallback(
    (question: string, answer: { text: string; selectedChips: string[] }, shouldProceedToAffirmations: boolean) => {
      if (shouldProceedToAffirmations) {
        // Store the exchange and show "creating affirmations" heart animation
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
          dynamicScreenData: null, // Clear screen data
          showHeartAnimation: true,
          heartAnimationMessage: `You have been doing great, ${prev.name}! We are creating your personalized affirmations.`,
        }));
      } else {
        // Store the exchange and show "thank you" heart animation, then fetch next screen
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
          dynamicScreenData: null, // Clear screen data for next fetch
          showHeartAnimation: true,
          heartAnimationMessage: `Thank you for sharing, ${prev.name}...`,
        }));
      }
    },
    []
  );

  // Generate all 20 affirmations and review summary
  const generateAllAffirmations = useCallback(async () => {
    if (!state.name) {
      updateState({ generationError: 'Name is required' });
      return;
    }

    updateState({
      isGenerating: true,
      generationError: null,
      currentStep: 6,
    });

    try {
      // Generate all 20 affirmations in one call
      const result = await generateAffirmations(state.gatheringContext);

      if (result.error) {
        updateState({
          isGenerating: false,
          generationError: result.error,
        });
        return;
      }

      // Generate review summary in parallel (don't block on it)
      const summaryPromise = generateReviewSummary(state.gatheringContext, state.topics);

      // Store affirmations
      updateState({
        allAffirmations: result.affirmations,
      });

      // Wait for summary and move to review step
      const summary = await summaryPromise;

      updateState({
        isGenerating: false,
        reviewSummary: summary || `Based on what you shared, we have created ${result.affirmations.length} affirmations just for you.`,
        currentStep: 7,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate affirmations';
      updateState({
        isGenerating: false,
        generationError: errorMessage,
      });
    }
  }, [state.name, state.gatheringContext, state.topics, updateState]);

  // Handle affirmation review completion
  const handleReviewComplete = useCallback(
    (likedAffirmations: string[]) => {
      updateState({
        likedAffirmations,
        currentStep: 8, // Move to background selection
      });
    },
    [updateState]
  );

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
            currentStep={3}
            name={state.name}
            familiarity={state.familiarity}
            onFamiliarityChange={(familiarity) => updateState({ familiarity })}
            onContinue={nextStep}
          />
        );

      case 4:
        return (
          <StepTopics
            currentStep={4}
            name={state.name}
            topics={state.topics}
            onTopicsChange={(topics) => updateState({ topics })}
            onContinue={handleTopicsComplete}
            onSkip={handleTopicsComplete}
          />
        );

      case 5:
        // Dynamic gathering screens (2-5 AI-generated screens)
        // Heart animation shows after each screen answer
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message={state.heartAnimationMessage}
              onComplete={() => {
                // If the heart animation was for "ready for affirmations", generate them
                if (state.heartAnimationMessage.includes('creating your personalized affirmations')) {
                  updateState({ showHeartAnimation: false });
                  generateAllAffirmations();
                } else {
                  // Continue to next dynamic screen - trigger fetch
                  updateState({
                    showHeartAnimation: false,
                    needsDynamicFetch: true,
                  });
                }
              }}
            />
          );
        }
        return (
          <StepDynamic
            screenData={state.dynamicScreenData}
            isLoading={state.isDynamicLoading}
            error={state.dynamicError}
            screenNumber={state.dynamicScreenNumber}
            onAnswer={handleDynamicAnswer}
            onRetry={handleDynamicRetry}
          />
        );

      case 6:
        // Affirmation generation loading state
        if (state.isGenerating) {
          return (
            <div className="flex flex-col h-full items-center justify-center p-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Creating your personal affirmations, {state.name}...
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
                onClick={generateAllAffirmations}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          );
        }

        // If not generating and no error, we're waiting for redirect to step 7
        return (
          <div className="flex flex-col h-full items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Preparing your affirmations...
            </p>
          </div>
        );

      case 7:
        // Affirmation review screen
        return (
          <AffirmationReview
            name={state.name}
            affirmations={state.allAffirmations}
            summary={state.reviewSummary}
            onComplete={handleReviewComplete}
          />
        );

      case 8:
        return <StepBackground onContinue={nextStep} />;

      case 9:
        return <StepNotifications onContinue={nextStep} />;

      case 10:
        return <StepPaywall onContinue={nextStep} />;

      case 11:
        return (
          <StepCompletion
            name={state.name}
            approvedAffirmations={state.likedAffirmations}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      {/* NO PROGRESS BAR - removed per FO-07 spec */}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center w-full">
        {renderStep()}
      </div>
    </div>
  );
}
