'use client';

import { useState, useCallback, useEffect } from 'react';
import { FO10_QUESTIONS, type FO10OnboardingData } from '../types';
import { generateChips, generateAffirmationBatchFO10 } from '../actions';
import { StepWelcome } from './step-welcome';
import { StepFamiliarity } from './step-familiarity';
import { StepGoal } from './step-goal';
import { StepWhy } from './step-why';
import { StepSituation } from './step-situation';
import { StepSupport } from './step-support';
import { HeartAnimation } from './heart-animation';
import { AffirmationCardFlow } from './affirmation-card-flow';
import { AffirmationSummary } from './affirmation-summary';
import { StepBackground } from './step-background';
import { StepNotifications } from './step-notifications';
import { StepPaywall } from './step-paywall';
import { StepCompletion } from './step-completion';

/**
 * FO-10 Onboarding state
 *
 * Flow phases:
 * - Steps 0-2: Welcome screens
 * - Step 3: Familiarity selection
 * - Steps 4-7: Fixed 4-question discovery with heart animation transitions
 *   - Step 4: Goal (predefined chips)
 *   - Step 5: Why (LLM fragments)
 *   - Step 6: Situation (LLM sentences)
 *   - Step 7: Support tone (LLM sentences)
 * - Step 8: Affirmation generation (loading state, generate 5 per batch)
 * - Step 9: AffirmationCardFlow — card-by-card love/discard
 * - Step 10: AffirmationSummary — "I am good with these" or "I want to create more"
 * - Steps 11-13: Post-review mockups (background, notifications, paywall)
 * - Step 14: Completion screen (shows ALL accumulated loved affirmations)
 */
export interface OnboardingState extends FO10OnboardingData {
  currentStep: number; // 0-14

  // Heart animation transition state
  showHeartAnimation: boolean;
  heartAnimationMessage: string;

  // Discovery step state
  discoveryStep: number; // 0-3 (maps to questions array index)
  discoveryInputs: Array<{ text: string }>; // 4 inputs for 4 questions

  // Chip loading state for steps 5-7
  isLoadingChips: boolean;
  chipsError: string | null;
  needsChipFetch: boolean;

  // Chip data for steps 5-7
  step5Chips: { initial: string[]; expanded: string[] } | null;
  step6Chips: { initial: string[]; expanded: string[] } | null;
  step7Chips: { initial: string[]; expanded: string[] } | null;

  // Affirmation generation state
  isGenerating: boolean;
  generationError: string | null;
  needsGeneration: boolean;
  batchNumber: number;
  currentBatchAffirmations: string[];

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
  familiarityLevel: 'somewhat',
  exchanges: [],
  showHeartAnimation: false,
  heartAnimationMessage: '',
  discoveryStep: 0,
  discoveryInputs: [
    { text: '' },
    { text: '' },
    { text: '' },
    { text: '' },
  ],
  isLoadingChips: false,
  chipsError: null,
  needsChipFetch: false,
  step5Chips: null,
  step6Chips: null,
  step7Chips: null,
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
 * Main state manager component for FO-10 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions with heart animations
 * - Orchestrates fixed 4-question discovery phase
 * - Generates 5 affirmations per batch
 * - Card-by-card review via AffirmationCardFlow
 * - Summary with "generate more" loop
 * - No persistence - state resets on refresh
 */
export function FOExperience() {
  const [state, setState] = useState<OnboardingState>(initialState);

  // Update specific state fields
  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Navigate to next step
  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 14),
    }));
  }, []);

  // Handle familiarity selection and move to discovery
  const handleFamiliarityComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 4, // Go to step 4 (Goal)
      discoveryStep: 0,
    }));
  }, []);

  // Handle discovery step input changes
  const handleDiscoveryInputChange = useCallback((stepIndex: number, value: { text: string }) => {
    setState((prev) => {
      const newInputs = [...prev.discoveryInputs];
      newInputs[stepIndex] = value;
      return { ...prev, discoveryInputs: newInputs };
    });
  }, []);

  // Handle discovery step continuation
  const handleDiscoveryContinue = useCallback(() => {
    const currentDiscoveryStep = state.discoveryStep;
    const currentInput = state.discoveryInputs[currentDiscoveryStep];
    const currentQuestion = FO10_QUESTIONS[currentDiscoveryStep];

    // Add exchange to the array
    const newExchange = {
      question: currentQuestion,
      answer: { text: currentInput.text },
    };

    setState((prev) => ({
      ...prev,
      exchanges: [...prev.exchanges, newExchange],
    }));

    // Determine next action based on which step we're on
    if (currentDiscoveryStep === 3) {
      // Step 7 (support tone) - last discovery step
      // Show "creating affirmations" heart animation
      setState((prev) => ({
        ...prev,
        showHeartAnimation: true,
        heartAnimationMessage: `You have been doing great, ${prev.name}! We are creating your personalized affirmations.`,
      }));
    } else {
      // Steps 4-6 - show "thank you" heart animation
      setState((prev) => ({
        ...prev,
        showHeartAnimation: true,
        heartAnimationMessage: `Thank you for sharing, ${prev.name}...`,
      }));
    }
  }, [state.discoveryStep, state.discoveryInputs, state.name]);

  // Handle heart animation completion
  const handleHeartAnimationComplete = useCallback(() => {
    const currentDiscoveryStep = state.discoveryStep;

    if (currentDiscoveryStep === 3) {
      // Last discovery step - generate affirmations
      setState((prev) => ({
        ...prev,
        showHeartAnimation: false,
        currentStep: 8, // Move to generation loading
        needsGeneration: true,
      }));
    } else {
      // Move to next discovery step
      const nextDiscoveryStep = currentDiscoveryStep + 1;
      const nextStep = 4 + nextDiscoveryStep; // Steps 4,5,6,7

      setState((prev) => ({
        ...prev,
        showHeartAnimation: false,
        discoveryStep: nextDiscoveryStep,
        currentStep: nextStep,
        needsChipFetch: nextDiscoveryStep > 0, // Steps 5-7 need chips
      }));
    }
  }, [state.discoveryStep]);

  // Fetch chips for steps 5-7
  const fetchChips = useCallback(async () => {
    const stepNumber = 4 + state.discoveryStep; // Convert to actual step number (5, 6, 7)

    try {
      const context: FO10OnboardingData = {
        name: state.name,
        familiarityLevel: state.familiarityLevel,
        exchanges: state.exchanges,
      };

      const result = await generateChips(stepNumber, context);

      if (result.error) {
        setState((prev) => ({
          ...prev,
          isLoadingChips: false,
          needsChipFetch: false,
          chipsError: result.error || 'Failed to load chips',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoadingChips: false,
        needsChipFetch: false,
        chipsError: null,
        [`step${stepNumber}Chips`]: {
          initial: result.initialChips,
          expanded: result.expandedChips,
        },
      }));
    } catch (error) {
      console.error('[fo-10] Error fetching chips:', error);
      setState((prev) => ({
        ...prev,
        isLoadingChips: false,
        needsChipFetch: false,
        chipsError: 'An unexpected error occurred',
      }));
    }
  }, [state.discoveryStep, state.name, state.familiarityLevel, state.exchanges]);

  // Trigger chip fetch when needed
  useEffect(() => {
    if (state.needsChipFetch && !state.showHeartAnimation) {
      setState((prev) => ({
        ...prev,
        isLoadingChips: true,
        chipsError: null,
        needsChipFetch: false,
      }));
      fetchChips();
    }
  }, [state.needsChipFetch, state.showHeartAnimation, fetchChips]);

  // Generate affirmations
  const generateAffirmations = useCallback(async () => {
    if (!state.name) {
      updateState({ generationError: 'Name is required', needsGeneration: false });
      return;
    }

    updateState({
      isGenerating: true,
      generationError: null,
      needsGeneration: false,
    });

    try {
      const context: FO10OnboardingData = {
        name: state.name,
        familiarityLevel: state.familiarityLevel,
        exchanges: state.exchanges,
      };

      const result = await generateAffirmationBatchFO10({
        context,
        batchNumber: state.batchNumber,
        approvedAffirmations: state.allLovedAffirmations,
        skippedAffirmations: state.allDiscardedAffirmations,
      });

      if (result.error) {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          generationError: result.error || 'Failed to generate affirmations',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        currentBatchAffirmations: result.affirmations,
        allGeneratedAffirmations: [...prev.allGeneratedAffirmations, ...result.affirmations],
        currentStep: 9, // Move to card review
      }));
    } catch (error) {
      console.error('[fo-10] Error generating affirmations:', error);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generationError: 'An unexpected error occurred',
      }));
    }
  }, [state.name, state.familiarityLevel, state.exchanges, state.batchNumber, state.allLovedAffirmations, state.allDiscardedAffirmations, updateState]);

  // Trigger generation when needsGeneration flag is set
  useEffect(() => {
    if (state.needsGeneration) {
      generateAffirmations();
    }
  }, [state.needsGeneration, generateAffirmations]);

  // Handle card flow completion
  const handleCardFlowComplete = useCallback(
    (loved: string[], discarded: string[]) => {
      setState((prev) => ({
        ...prev,
        allLovedAffirmations: [...prev.allLovedAffirmations, ...loved],
        allDiscardedAffirmations: [...prev.allDiscardedAffirmations, ...discarded],
        currentStep: 10, // Move to summary
      }));
    },
    []
  );

  // Handle "I am good with these" from summary
  const handleSummaryDone = useCallback(() => {
    updateState({ currentStep: 11 }); // Move to background selection
  }, [updateState]);

  // Handle "I want to create more" from summary
  const handleSummaryMore = useCallback(() => {
    setState((prev) => ({
      ...prev,
      batchNumber: prev.batchNumber + 1,
      currentStep: 8,
      isGenerating: true,
      generationError: null,
      needsGeneration: true,
    }));
  }, []);

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
            familiarity={state.familiarityLevel}
            onFamiliarityChange={(familiarity) => updateState({ familiarityLevel: familiarity })}
            onContinue={handleFamiliarityComplete}
          />
        );

      case 4:
        // Goal step with predefined chips
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message={state.heartAnimationMessage}
              onComplete={handleHeartAnimationComplete}
            />
          );
        }
        return (
          <StepGoal
            currentStep={4}
            name={state.name}
            value={state.discoveryInputs[0]}
            onChange={(value) => handleDiscoveryInputChange(0, value)}
            onContinue={handleDiscoveryContinue}
          />
        );

      case 5:
        // Why step with LLM fragments
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message={state.heartAnimationMessage}
              onComplete={handleHeartAnimationComplete}
            />
          );
        }
        return (
          <StepWhy
            currentStep={5}
            name={state.name}
            initialChips={state.step5Chips?.initial || []}
            expandedChips={state.step5Chips?.expanded || []}
            value={state.discoveryInputs[1]}
            onChange={(value) => handleDiscoveryInputChange(1, value)}
            onContinue={handleDiscoveryContinue}
            isLoading={state.isLoadingChips}
          />
        );

      case 6:
        // Situation step with LLM sentences
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message={state.heartAnimationMessage}
              onComplete={handleHeartAnimationComplete}
            />
          );
        }
        return (
          <StepSituation
            currentStep={6}
            name={state.name}
            initialChips={state.step6Chips?.initial || []}
            expandedChips={state.step6Chips?.expanded || []}
            value={state.discoveryInputs[2]}
            onChange={(value) => handleDiscoveryInputChange(2, value)}
            onContinue={handleDiscoveryContinue}
            isLoading={state.isLoadingChips}
          />
        );

      case 7:
        // Support tone step with LLM sentences
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message={state.heartAnimationMessage}
              onComplete={handleHeartAnimationComplete}
            />
          );
        }
        return (
          <StepSupport
            currentStep={7}
            name={state.name}
            initialChips={state.step7Chips?.initial || []}
            expandedChips={state.step7Chips?.expanded || []}
            value={state.discoveryInputs[3]}
            onChange={(value) => handleDiscoveryInputChange(3, value)}
            onContinue={handleDiscoveryContinue}
            isLoading={state.isLoadingChips}
          />
        );

      case 8:
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

        // If not generating and no error, we're waiting for redirect
        return (
          <div className="flex flex-col h-full items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Preparing your affirmations...
            </p>
          </div>
        );

      case 9:
        // Card-by-card review
        return (
          <AffirmationCardFlow
            affirmations={state.currentBatchAffirmations}
            onComplete={handleCardFlowComplete}
          />
        );

      case 10:
        // Summary screen
        return (
          <AffirmationSummary
            lovedAffirmations={[...state.allLovedAffirmations]}
            onDone={handleSummaryDone}
            onMore={handleSummaryMore}
          />
        );

      case 11:
        return <StepBackground onContinue={nextStep} />;

      case 12:
        return <StepNotifications onContinue={nextStep} />;

      case 13:
        return <StepPaywall onContinue={nextStep} />;

      case 14:
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
      {/* NO PROGRESS BAR - removed per FO-10 spec */}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center w-full">
        {renderStep()}
      </div>
    </div>
  );
}
