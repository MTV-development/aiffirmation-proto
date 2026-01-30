'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  generateFirstScreenFragments,
  generateDynamicScreen,
  generateAffirmationBatchFO09,
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
import { AffirmationCardFlow } from './affirmation-card-flow';
import { AffirmationSummary } from './affirmation-summary';
import { StepBackground } from './step-background';
import { StepNotifications } from './step-notifications';
import { StepPaywall } from './step-paywall';
import { StepCompletion } from './step-completion';

/**
 * FO-09 Onboarding data collected during the flow.
 * Uses GatheringContext with dynamic exchanges and fragment-based input.
 * Key differences from FO-08:
 * - Screen 1 uses mode="sentences", screens 2+ use mode="fragments"
 * - No reflectiveStatement
 * - Generates 5 affirmations per batch (not 2×10)
 * - Card-by-card review with love/discard cycle
 */
export interface FO09OnboardingData {
  name: string;
  familiarity: 'new' | 'some' | 'very' | null;
  topics: string[];
  gatheringContext: GatheringContext;
}

/**
 * FO-09 Onboarding state
 *
 * Flow phases:
 * - Steps 0-2: Welcome screens
 * - Step 3: Familiarity selection
 * - Step 4: Topic selection
 * - Step 5: Dynamic gathering screens (2-5 AI-generated screens) with heart animation transitions
 * - Step 6: Affirmation generation (loading state, generate 5 per batch)
 * - Step 7: AffirmationCardFlow — card-by-card love/discard
 * - Step 8: AffirmationSummary — "I am good with these" or "I want to create more"
 * - Steps 9-11: Post-review mockups (background, notifications, paywall)
 * - Step 12: Completion screen (shows ALL accumulated loved affirmations)
 *
 * Key differences from FO-08:
 * - NO PROGRESS BAR
 * - Uses FragmentInput with mode="sentences" (screen 1) / mode="fragments" (screens 2+)
 * - No reflectiveStatement on any screen
 * - Single batch of 5 affirmations per cycle
 * - Card review (AffirmationCardFlow) instead of AffirmationReview
 * - Summary screen with generate-more loop
 * - Tracks allLovedAffirmations, allDiscardedAffirmations, allGeneratedAffirmations across cycles
 */
export interface OnboardingState extends FO09OnboardingData {
  currentStep: number; // 0-12

  // Heart animation transition state
  showHeartAnimation: boolean;
  heartAnimationMessage: string;

  // Dynamic gathering screen state
  dynamicScreenNumber: number; // 1-indexed, tracks position in dynamic phase (1-5)
  firstScreenFragments: FirstScreenFragmentsResponse | null;
  dynamicScreenData: DynamicScreenResponse | null;
  isDynamicLoading: boolean;
  dynamicError: string | null;
  needsDynamicFetch: boolean; // Flag to trigger fetch

  // Affirmation generation state
  isGenerating: boolean;
  generationError: string | null;
  needsGeneration: boolean; // Flag to trigger generation via useEffect
  batchNumber: number; // Tracks which batch we're on (1, 2, 3, ...)
  currentBatchAffirmations: string[]; // Current batch of 5 for card review

  // Accumulated across all cycles
  allLovedAffirmations: string[];
  allDiscardedAffirmations: string[];
  allGeneratedAffirmations: string[];

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
  needsGeneration: false,
  batchNumber: 1,
  currentBatchAffirmations: [],
  allLovedAffirmations: [],
  allDiscardedAffirmations: [],
  allGeneratedAffirmations: [],
  selectedBackground: null,
  notificationFrequency: null,
};

/**
 * Main state manager component for FO-09 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions
 * - Orchestrates dynamic gathering phase with AI-generated screens
 * - Screen 1: Fixed question + generated sentence starters (mode="sentences")
 * - Screens 2+: Full dynamic screen with fragments (mode="fragments"), no reflectiveStatement
 * - Generates 5 affirmations per batch
 * - Card-by-card review via AffirmationCardFlow
 * - Summary with "generate more" loop
 * - No persistence - state resets on refresh
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
      currentStep: Math.min(prev.currentStep + 1, 12),
    }));
  }, []);

  // Fetch first screen fragments (for screen 1) — FO-09 passes topics
  const fetchFirstScreenFragments = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isDynamicLoading: true,
      dynamicError: null,
      needsDynamicFetch: false,
    }));

    try {
      const response = await generateFirstScreenFragments(state.name, state.topics);

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
  }, [state.name, state.topics]);

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

  // Generate 5 affirmations in a single batch
  // Called directly from heart animation completion, or triggered via needsGeneration flag
  const generateAffirmations = useCallback(async () => {
    if (!state.name) {
      updateState({ generationError: 'Name is required', needsGeneration: false });
      return;
    }

    updateState({
      isGenerating: true,
      generationError: null,
      needsGeneration: false,
      currentStep: 6,
    });

    try {
      const result = await generateAffirmationBatchFO09({
        context: state.gatheringContext,
        batchNumber: state.batchNumber,
        approvedAffirmations: state.allLovedAffirmations,
        skippedAffirmations: state.allDiscardedAffirmations,
      });

      if (result.error) {
        updateState({
          isGenerating: false,
          generationError: result.error ?? 'Unknown error',
        });
        return;
      }

      // Store batch and advance to card review
      setState((s) => ({
        ...s,
        isGenerating: false,
        currentBatchAffirmations: result.affirmations,
        allGeneratedAffirmations: [...s.allGeneratedAffirmations, ...result.affirmations],
        currentStep: 7,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate affirmations';
      updateState({
        isGenerating: false,
        generationError: errorMessage,
      });
    }
  }, [state.name, state.gatheringContext, state.batchNumber, state.allLovedAffirmations, state.allDiscardedAffirmations, updateState]);

  // Handle card flow completion — merge loved/discarded into accumulated arrays
  const handleCardFlowComplete = useCallback(
    (loved: string[], discarded: string[]) => {
      setState((prev) => ({
        ...prev,
        allLovedAffirmations: [...prev.allLovedAffirmations, ...loved],
        allDiscardedAffirmations: [...prev.allDiscardedAffirmations, ...discarded],
        currentStep: 8, // Move to summary
      }));
    },
    []
  );

  // Handle "I am good with these" from summary
  const handleSummaryDone = useCallback(() => {
    updateState({ currentStep: 9 }); // Move to background selection
  }, [updateState]);

  // Handle "I want to create more" from summary — loop back to generation
  const handleSummaryMore = useCallback(() => {
    setState((prev) => ({
      ...prev,
      batchNumber: prev.batchNumber + 1,
      currentStep: 6,
      isGenerating: true,
      generationError: null,
      needsGeneration: true,
    }));
  }, []);

  // Trigger generation when needsGeneration flag is set (used by "generate more" flow)
  useEffect(() => {
    if (state.needsGeneration) {
      generateAffirmations();
    }
  }, [state.needsGeneration, generateAffirmations]);

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

    // Screen 1: Fixed question + generated sentence starters (mode="sentences")
    if (state.dynamicScreenNumber === 1 && state.firstScreenFragments) {
      return (
        <FragmentInput
          mode="sentences"
          question={FIXED_OPENING_QUESTION}
          initialFragments={state.firstScreenFragments.initialFragments}
          expandedFragments={state.firstScreenFragments.expandedFragments}
          value={dynamicInput}
          onChange={setDynamicInput}
          onContinue={handleDynamicContinue}
        />
      );
    }

    // Screens 2+: Dynamic screen with fragments (mode="fragments"), no reflectiveStatement
    if (state.dynamicScreenNumber > 1 && state.dynamicScreenData) {
      return (
        <FragmentInput
          mode="fragments"
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
                  generateAffirmations();
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
                {state.batchNumber > 1
                  ? 'Creating more affirmations...'
                  : `Creating your personal affirmations, ${state.name}...`}
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
                onClick={generateAffirmations}
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
        // Card-by-card review (AffirmationCardFlow)
        return (
          <AffirmationCardFlow
            affirmations={state.currentBatchAffirmations}
            onComplete={handleCardFlowComplete}
          />
        );

      case 8:
        // Summary screen showing ALL accumulated loved affirmations
        return (
          <AffirmationSummary
            lovedAffirmations={[...state.allLovedAffirmations]}
            onDone={handleSummaryDone}
            onMore={handleSummaryMore}
          />
        );

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
            approvedAffirmations={state.allLovedAffirmations}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      {/* NO PROGRESS BAR - removed per FO-09 spec */}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center w-full">
        {renderStep()}
      </div>
    </div>
  );
}
