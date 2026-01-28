'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  generateFirstScreenFragments,
  generateDynamicScreen,
  generateAffirmationBatchFO08,
  generateSummary,
} from '../actions';
import {
  type GatheringContext,
  type DynamicScreenResponse,
  type FirstScreenFragmentsResponse,
  FIXED_OPENING_QUESTION,
} from '../types';
import { StepWelcome } from './step-welcome';
import { StepFamiliarity } from './step-familiarity';
import { StepTopics } from './step-topics';
import { HeartAnimation } from './heart-animation';
import { FragmentInput } from './fragment-input';
import { AffirmationReview } from './affirmation-review';
import { StepBackground } from './step-background';
import { StepNotifications } from './step-notifications';
import { StepPaywall } from './step-paywall';
import { StepCompletion } from './step-completion';

/**
 * FO-08 Onboarding data collected during the flow.
 * Uses GatheringContext with dynamic exchanges and fragment-based input.
 * Key difference from FO-07: Uses fragments (sentence starters) instead of chips,
 * and screen 1 uses a fixed opening question with generated fragments.
 */
export interface FO08OnboardingData {
  name: string;
  familiarity: 'new' | 'some' | 'very' | null;
  topics: string[];
  gatheringContext: GatheringContext;
}

/**
 * FO-08 Onboarding state
 *
 * Flow phases:
 * - Steps 0-2: Welcome screens
 * - Step 3: Familiarity selection
 * - Step 4: Topic selection
 * - Step 5: Dynamic gathering screens (2-5 AI-generated screens) with heart animation transitions
 * - Step 6: Affirmation generation (loading state, generate all 20 at once via 2 batches)
 * - Step 7: AffirmationReview screen
 * - Steps 8-10: Post-review mockups (background, notifications, paywall)
 * - Step 11: Completion screen
 *
 * Key differences from FO-07:
 * - NO PROGRESS BAR
 * - Uses FragmentInput with sentence-starter fragments
 * - Screen 1 uses FIXED_OPENING_QUESTION with generateFirstScreenFragments
 * - Screens 2+ use generateDynamicScreen with reflectiveStatement
 * - Heart animation after each dynamic screen
 */
export interface OnboardingState extends FO08OnboardingData {
  currentStep: number; // 0-11

  // Heart animation transition state
  showHeartAnimation: boolean;
  heartAnimationMessage: string;

  // Dynamic gathering screen state
  dynamicScreenNumber: number; // 1-indexed, tracks position in dynamic phase (1-5)
  // Screen 1 uses FirstScreenFragmentsResponse, screens 2+ use DynamicScreenResponse
  firstScreenFragments: FirstScreenFragmentsResponse | null;
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
    exchanges: [],
    screenNumber: 1,
  },
  showHeartAnimation: false,
  heartAnimationMessage: '',
  dynamicScreenNumber: 1,
  firstScreenFragments: null,
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
 * Main state manager component for FO-08 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions
 * - Orchestrates dynamic gathering phase with AI-generated screens
 * - Screen 1: Fixed question + generated fragments
 * - Screens 2+: Full dynamic screen with reflectiveStatement
 * - Generates 20 affirmations in two batches
 * - Shows AffirmationReview for rating affirmations
 * - No persistence - state resets on refresh
 *
 * Key differences from FO-07:
 * - NO PROGRESS BAR
 * - Heart animation after each dynamic screen
 * - Uses fragment-based input (sentence starters)
 * - Screen 1 special handling with FIXED_OPENING_QUESTION
 */
export function FOExperience() {
  const [state, setState] = useState<OnboardingState>(initialState);

  // Input state for dynamic screens
  const [dynamicInput, setDynamicInput] = useState({ text: '' });

  // Update specific state fields
  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Navigate to next step
  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 11),
    }));
  }, []);

  // Fetch first screen fragments (for screen 1)
  const fetchFirstScreenFragments = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isDynamicLoading: true,
      dynamicError: null,
      needsDynamicFetch: false,
    }));

    try {
      const response = await generateFirstScreenFragments(state.name);

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
          firstScreenFragments: response,
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
  }, [state.name]);

  // Fetch dynamic screen (for screens 2+)
  const fetchDynamicScreen = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isDynamicLoading: true,
      dynamicError: null,
      needsDynamicFetch: false,
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
      if (state.dynamicScreenNumber === 1) {
        fetchFirstScreenFragments();
      } else {
        fetchDynamicScreen();
      }
    }
  }, [state.needsDynamicFetch, state.currentStep, state.showHeartAnimation, state.dynamicScreenNumber, fetchFirstScreenFragments, fetchDynamicScreen]);

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
        exchanges: [],
        screenNumber: 1,
      },
      dynamicScreenNumber: 1,
      firstScreenFragments: null,
      dynamicScreenData: null,
      isDynamicLoading: false,
      dynamicError: null,
      needsDynamicFetch: true, // Trigger fetch for first dynamic screen
    }));
    setDynamicInput({ text: '' });
  }, []);

  // Handle answer from dynamic screen
  const handleDynamicContinue = useCallback(() => {
    // Get the current question based on screen number
    const question = state.dynamicScreenNumber === 1
      ? FIXED_OPENING_QUESTION
      : state.dynamicScreenData?.question || '';

    // Determine if we should proceed to affirmations based on screen count logic
    let shouldProceedToAffirmations = false;

    if (state.dynamicScreenNumber < 2) {
      // Minimum 2 screens - continue to next screen
      shouldProceedToAffirmations = false;
    } else if (state.dynamicScreenNumber >= 5) {
      // Maximum 5 screens - proceed to affirmations
      shouldProceedToAffirmations = true;
    } else {
      // Between 2-4 screens - respect agent's decision
      shouldProceedToAffirmations = state.dynamicScreenData?.readyForAffirmations ?? false;
    }

    if (shouldProceedToAffirmations) {
      // Store the exchange and show "creating affirmations" heart animation
      setState((prev) => ({
        ...prev,
        gatheringContext: {
          ...prev.gatheringContext,
          exchanges: [
            ...prev.gatheringContext.exchanges,
            { question, answer: { text: dynamicInput.text } },
          ],
          screenNumber: prev.dynamicScreenNumber + 1,
        },
        dynamicScreenNumber: prev.dynamicScreenNumber + 1,
        firstScreenFragments: null,
        dynamicScreenData: null,
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
            { question, answer: { text: dynamicInput.text } },
          ],
          screenNumber: prev.dynamicScreenNumber + 1,
        },
        dynamicScreenNumber: prev.dynamicScreenNumber + 1,
        firstScreenFragments: null,
        dynamicScreenData: null,
        showHeartAnimation: true,
        heartAnimationMessage: `Thank you for sharing, ${prev.name}...`,
      }));
    }

    // Reset input for next screen
    setDynamicInput({ text: '' });
  }, [state.dynamicScreenNumber, state.dynamicScreenData, state.name, dynamicInput.text]);

  // Generate all 20 affirmations (2 batches of 10) and review summary
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
      // Generate first batch of 10 affirmations
      const batch1Result = await generateAffirmationBatchFO08({
        context: state.gatheringContext,
        batchNumber: 1,
        approvedAffirmations: [],
        skippedAffirmations: [],
      });

      if (batch1Result.error) {
        updateState({
          isGenerating: false,
          generationError: batch1Result.error,
        });
        return;
      }

      // Generate second batch of 10 affirmations
      const batch2Result = await generateAffirmationBatchFO08({
        context: state.gatheringContext,
        batchNumber: 2,
        approvedAffirmations: [],
        skippedAffirmations: [],
      });

      if (batch2Result.error) {
        updateState({
          isGenerating: false,
          generationError: batch2Result.error,
        });
        return;
      }

      // Combine both batches
      const allAffirmations = [...batch1Result.affirmations, ...batch2Result.affirmations];

      // Generate review summary in parallel (don't block on it)
      const summaryPromise = generateSummary(state.gatheringContext, state.topics);

      // Store affirmations
      updateState({
        allAffirmations,
      });

      // Wait for summary and move to review step
      const summary = await summaryPromise;

      updateState({
        isGenerating: false,
        reviewSummary: summary || `Based on what you shared, we have created ${allAffirmations.length} affirmations just for you.`,
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

  // Render dynamic screen content (screen 1 or screens 2+)
  const renderDynamicScreen = () => {
    if (state.isDynamicLoading) {
      return (
        <div className="max-w-md mx-auto p-8 text-center py-16">
          <p className="text-xl text-gray-600 dark:text-gray-400">Thinking...</p>
        </div>
      );
    }

    if (state.dynamicError) {
      return (
        <div className="max-w-md mx-auto p-8 text-center py-16">
          <p className="text-lg text-red-600 dark:text-red-400 mb-6">{state.dynamicError}</p>
          <button
            onClick={handleDynamicRetry}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    // Screen 1: Fixed question + generated fragments
    if (state.dynamicScreenNumber === 1 && state.firstScreenFragments) {
      return (
        <FragmentInput
          question={FIXED_OPENING_QUESTION}
          initialFragments={state.firstScreenFragments.initialFragments}
          expandedFragments={state.firstScreenFragments.expandedFragments}
          value={dynamicInput}
          onChange={setDynamicInput}
          onContinue={handleDynamicContinue}
        />
      );
    }

    // Screens 2+: Full dynamic screen with reflectiveStatement
    if (state.dynamicScreenNumber > 1 && state.dynamicScreenData) {
      return (
        <FragmentInput
          reflectiveStatement={state.dynamicScreenData.reflectiveStatement}
          question={state.dynamicScreenData.question}
          initialFragments={state.dynamicScreenData.initialFragments}
          expandedFragments={state.dynamicScreenData.expandedFragments}
          value={dynamicInput}
          onChange={setDynamicInput}
          onContinue={handleDynamicContinue}
        />
      );
    }

    return null;
  };

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
        return renderDynamicScreen();

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
      {/* NO PROGRESS BAR - removed per FO-08 spec */}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center w-full">
        {renderStep()}
      </div>
    </div>
  );
}
