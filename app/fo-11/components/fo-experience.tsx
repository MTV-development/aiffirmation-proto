'use client';

import { useState, useCallback, useEffect } from 'react';
import { FO11_GOAL_QUESTION, type FO11OnboardingData } from '../types';
import { generateDiscoveryStep, generateAffirmationBatchFO11 } from '../actions';
import { useImplementation } from '@/src/fo-11';
import { StepWelcome } from './step-welcome';
import { StepFamiliarity } from './step-familiarity';
import { StepGoal } from './step-goal';
import { StepContext } from './step-context';
import { StepTone } from './step-tone';
import { StepAdditional } from './step-additional';
import { HeartAnimation } from './heart-animation';
import { AffirmationCardFlow } from './affirmation-card-flow';
import { AffirmationSummary } from './affirmation-summary';
import { StepBackground } from './step-background';
import { StepNotifications } from './step-notifications';
import { StepPaywall } from './step-paywall';
import { StepCompletion } from './step-completion';

/**
 * FO-11 Onboarding state
 *
 * Flow phases:
 * - Steps 0-2: Welcome screens
 * - Step 3: Familiarity selection (cosmetic only — not passed to agents)
 * - Step 4: Goal (predefined chips, same as FO-10)
 * - Step 5: Context (LLM question + fragments, OR silently skipped)
 * - Step 6: Tone (LLM question + single-word chips)
 * - Step 7: Additional context (optional — sentence fragment chips)
 * - Step 8: Affirmation generation (loading state, generate 5 per batch)
 * - Step 9: AffirmationCardFlow — card-by-card love/discard
 * - Step 10: AffirmationSummary — "I am good with these" or "I want to create more"
 * - Steps 11-13: Post-review mockups (background, notifications, paywall)
 * - Step 14: Completion screen (shows ALL accumulated loved affirmations)
 */
export interface OnboardingState extends FO11OnboardingData {
  currentStep: number; // 0-14

  // Heart animation transition state
  showHeartAnimation: boolean;
  heartAnimationMessage: string;
  heartAnimationCompleted: boolean;

  // Discovery inputs (goal + context + tone + additional)
  goalInput: { text: string };
  contextInput: { text: string };
  toneInput: { text: string };
  step7Input: { text: string };

  // Skip logic for step 5
  step5Skipped: boolean;

  // Discovery step data from LLM
  step5Data: { question: string; initialChips: string[]; expandedChips: string[] } | null;
  step6Data: { question: string; initialChips: string[]; expandedChips: string[] } | null;
  step7Data: { question: string; initialChips: string[]; expandedChips: string[] } | null;

  // Loading state for discovery steps
  isLoadingDiscovery: boolean;
  discoveryError: string | null;

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
  heartAnimationCompleted: false,
  goalInput: { text: '' },
  contextInput: { text: '' },
  toneInput: { text: '' },
  step7Input: { text: '' },
  step5Skipped: false,
  step5Data: null,
  step6Data: null,
  step7Data: null,
  isLoadingDiscovery: false,
  discoveryError: null,
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
 * Main state manager component for FO-11 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions with heart animations
 * - Orchestrates 2-3 discovery steps with skip logic for step 5
 * - Generates 5 affirmations per batch
 * - Card-by-card review via AffirmationCardFlow
 * - Summary with "generate more" loop
 * - No persistence - state resets on refresh
 */
export function FOExperience() {
  const { implementation } = useImplementation();
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
    }));
  }, []);

  // Handle goal step (step 4) completion
  const handleGoalContinue = useCallback(() => {
    const goalQuestion = FO11_GOAL_QUESTION.replace('[name]', state.name);
    const goalExchange = {
      question: goalQuestion,
      answer: { text: state.goalInput.text },
    };

    const newExchanges = [goalExchange];

    // Show heart animation: "Thank you for sharing, [name]..."
    setState((prev) => ({
      ...prev,
      exchanges: newExchanges,
      showHeartAnimation: true,
      heartAnimationMessage: `Thank you for sharing, ${prev.name}...`,
      isLoadingDiscovery: true,
      discoveryError: null,
    }));

    // Call discovery agent for step 5 during heart animation
    const context: FO11OnboardingData = {
      name: state.name,
      familiarityLevel: state.familiarityLevel,
      exchanges: newExchanges,
    };

    generateDiscoveryStep(5, context, implementation).then((result) => {
      if (result.error) {
        setState((prev) => ({
          ...prev,
          isLoadingDiscovery: false,
          discoveryError: result.error || 'Failed to load discovery step',
        }));
        return;
      }

      if (result.skip) {
        // Step 5 is skipped — immediately call discovery for step 6
        setState((prev) => ({
          ...prev,
          step5Skipped: true,
        }));

        generateDiscoveryStep(6, context, implementation).then((step6Result) => {
          if (step6Result.error) {
            setState((prev) => ({
              ...prev,
              isLoadingDiscovery: false,
              discoveryError: step6Result.error || 'Failed to load tone step',
            }));
            return;
          }

          setState((prev) => ({
            ...prev,
            isLoadingDiscovery: false,
            step6Data: {
              question: step6Result.question,
              initialChips: step6Result.initialChips,
              expandedChips: step6Result.expandedChips,
            },
          }));
        }).catch((error) => {
          console.error('[fo-11] Error fetching step 6 (after skip):', error);
          setState((prev) => ({
            ...prev,
            isLoadingDiscovery: false,
            discoveryError: 'An unexpected error occurred',
          }));
        });
      } else {
        // Step 5 not skipped — store step 5 data
        setState((prev) => ({
          ...prev,
          isLoadingDiscovery: false,
          step5Skipped: false,
          step5Data: {
            question: result.question,
            initialChips: result.initialChips,
            expandedChips: result.expandedChips,
          },
        }));
      }
    }).catch((error) => {
      console.error('[fo-11] Error fetching step 5:', error);
      setState((prev) => ({
        ...prev,
        isLoadingDiscovery: false,
        discoveryError: 'An unexpected error occurred',
      }));
    });
  }, [state.name, state.goalInput.text, state.familiarityLevel, implementation]);

  // Handle context step (step 5) completion
  const handleContextContinue = useCallback(() => {
    const contextExchange = {
      question: state.step5Data?.question || '',
      answer: { text: state.contextInput.text },
    };

    const newExchanges = [...state.exchanges, contextExchange];

    // Show heart animation: "Thank you for sharing, [name]..."
    setState((prev) => ({
      ...prev,
      exchanges: newExchanges,
      showHeartAnimation: true,
      heartAnimationMessage: `Thank you for sharing, ${prev.name}...`,
      isLoadingDiscovery: true,
      discoveryError: null,
    }));

    // Call discovery agent for step 6 during heart animation
    const context: FO11OnboardingData = {
      name: state.name,
      familiarityLevel: state.familiarityLevel,
      exchanges: newExchanges,
    };

    generateDiscoveryStep(6, context, implementation).then((result) => {
      if (result.error) {
        setState((prev) => ({
          ...prev,
          isLoadingDiscovery: false,
          discoveryError: result.error || 'Failed to load tone step',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoadingDiscovery: false,
        step6Data: {
          question: result.question,
          initialChips: result.initialChips,
          expandedChips: result.expandedChips,
        },
      }));
    }).catch((error) => {
      console.error('[fo-11] Error fetching step 6:', error);
      setState((prev) => ({
        ...prev,
        isLoadingDiscovery: false,
        discoveryError: 'An unexpected error occurred',
      }));
    });
  }, [state.exchanges, state.step5Data, state.contextInput.text, state.name, state.familiarityLevel, implementation]);

  // Handle tone step (step 6) completion
  const handleToneContinue = useCallback(() => {
    const toneExchange = {
      question: state.step6Data?.question || '',
      answer: { text: state.toneInput.text },
    };

    const newExchanges = [...state.exchanges, toneExchange];

    // Show heart animation: "Thank you for sharing, [name]..."
    setState((prev) => ({
      ...prev,
      exchanges: newExchanges,
      showHeartAnimation: true,
      heartAnimationMessage: `Thank you for sharing, ${prev.name}...`,
      isLoadingDiscovery: true,
      discoveryError: null,
    }));

    // Call discovery agent for step 7 during heart animation
    const context: FO11OnboardingData = {
      name: state.name,
      familiarityLevel: state.familiarityLevel,
      exchanges: newExchanges,
    };

    generateDiscoveryStep(7, context, implementation).then((result) => {
      if (result.error) {
        setState((prev) => ({
          ...prev,
          isLoadingDiscovery: false,
          discoveryError: result.error || 'Failed to load additional context step',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoadingDiscovery: false,
        step7Data: {
          question: result.question,
          initialChips: result.initialChips,
          expandedChips: result.expandedChips,
        },
      }));
    }).catch((error) => {
      console.error('[fo-11] Error fetching step 7:', error);
      setState((prev) => ({
        ...prev,
        isLoadingDiscovery: false,
        discoveryError: 'An unexpected error occurred',
      }));
    });
  }, [state.exchanges, state.step6Data, state.toneInput.text, state.name, state.familiarityLevel, implementation]);

  // Handle additional context step (step 7) completion
  const handleAdditionalContinue = useCallback(() => {
    let newExchanges = [...state.exchanges];

    // Only add exchange if user provided text
    if (state.step7Input.text.trim().length > 0) {
      const additionalExchange = {
        question: state.step7Data?.question || '',
        answer: { text: state.step7Input.text },
      };
      newExchanges = [...newExchanges, additionalExchange];
    }

    // Show heart animation: "You have been doing great, [name]!"
    setState((prev) => ({
      ...prev,
      exchanges: newExchanges,
      showHeartAnimation: true,
      heartAnimationMessage: `You have been doing great, ${prev.name}! We are creating your personalized affirmations.`,
    }));
  }, [state.exchanges, state.step7Data, state.step7Input.text]);

  // Handle heart animation completion
  const handleHeartAnimationComplete = useCallback(() => {
    const currentStep = state.currentStep;

    if (currentStep === 4) {
      // After goal — check if discovery data is ready
      if (state.isLoadingDiscovery) {
        // Still loading — mark animation as completed, wait for data
        setState((prev) => ({
          ...prev,
          heartAnimationCompleted: true,
        }));
        return;
      }

      if (state.step5Skipped) {
        // Skip to step 6
        setState((prev) => ({
          ...prev,
          showHeartAnimation: false,
          heartAnimationCompleted: false,
          currentStep: 6,
        }));
      } else {
        // Go to step 5
        setState((prev) => ({
          ...prev,
          showHeartAnimation: false,
          heartAnimationCompleted: false,
          currentStep: 5,
        }));
      }
    } else if (currentStep === 5) {
      // After context — check if step 6 data is ready
      if (state.isLoadingDiscovery) {
        setState((prev) => ({
          ...prev,
          heartAnimationCompleted: true,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        showHeartAnimation: false,
        heartAnimationCompleted: false,
        currentStep: 6,
      }));
    } else if (currentStep === 6) {
      // After tone — check if step 7 data is ready
      if (state.isLoadingDiscovery) {
        setState((prev) => ({
          ...prev,
          heartAnimationCompleted: true,
        }));
        return;
      }

      // Go to step 7 (additional context)
      setState((prev) => ({
        ...prev,
        showHeartAnimation: false,
        heartAnimationCompleted: false,
        currentStep: 7,
      }));
    } else if (currentStep === 7) {
      // After additional context — go to generation
      setState((prev) => ({
        ...prev,
        showHeartAnimation: false,
        heartAnimationCompleted: false,
        currentStep: 8,
        needsGeneration: true,
      }));
    }
  }, [state.currentStep, state.isLoadingDiscovery, state.step5Skipped]);

  // Transition to next step when heart animation completed and discovery data is ready
  useEffect(() => {
    if (state.heartAnimationCompleted && !state.isLoadingDiscovery && !state.discoveryError) {
      if (state.currentStep === 4) {
        if (state.step5Skipped) {
          setState((prev) => ({
            ...prev,
            showHeartAnimation: false,
            heartAnimationCompleted: false,
            currentStep: 6,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            showHeartAnimation: false,
            heartAnimationCompleted: false,
            currentStep: 5,
          }));
        }
      } else if (state.currentStep === 5) {
        setState((prev) => ({
          ...prev,
          showHeartAnimation: false,
          heartAnimationCompleted: false,
          currentStep: 6,
        }));
      } else if (state.currentStep === 6) {
        setState((prev) => ({
          ...prev,
          showHeartAnimation: false,
          heartAnimationCompleted: false,
          currentStep: 7,
        }));
      }
    }
  }, [state.heartAnimationCompleted, state.isLoadingDiscovery, state.discoveryError, state.currentStep, state.step5Skipped]);

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
      const context: FO11OnboardingData = {
        name: state.name,
        familiarityLevel: state.familiarityLevel,
        exchanges: state.exchanges,
      };

      const result = await generateAffirmationBatchFO11({
        context,
        batchNumber: state.batchNumber,
        approvedAffirmations: state.allLovedAffirmations,
        skippedAffirmations: state.allDiscardedAffirmations,
        implementation,
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
      console.error('[fo-11] Error generating affirmations:', error);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generationError: 'An unexpected error occurred',
      }));
    }
  }, [state.name, state.familiarityLevel, state.exchanges, state.batchNumber, state.allLovedAffirmations, state.allDiscardedAffirmations, updateState, implementation]);

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
            value={state.goalInput}
            onChange={(value) => updateState({ goalInput: value })}
            onContinue={handleGoalContinue}
          />
        );

      case 5:
        // Context step with LLM fragments (may have been skipped)
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message={state.heartAnimationMessage}
              onComplete={handleHeartAnimationComplete}
            />
          );
        }
        return (
          <StepContext
            currentStep={5}
            name={state.name}
            question={state.step5Data?.question || ''}
            initialChips={state.step5Data?.initialChips || []}
            expandedChips={state.step5Data?.expandedChips || []}
            value={state.contextInput}
            onChange={(value) => updateState({ contextInput: value })}
            onContinue={handleContextContinue}
            isLoading={state.isLoadingDiscovery}
          />
        );

      case 6:
        // Tone step with single-word chips
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message={state.heartAnimationMessage}
              onComplete={handleHeartAnimationComplete}
            />
          );
        }
        return (
          <StepTone
            currentStep={6}
            name={state.name}
            question={state.step6Data?.question || ''}
            initialChips={state.step6Data?.initialChips || []}
            expandedChips={state.step6Data?.expandedChips || []}
            value={state.toneInput}
            onChange={(value) => updateState({ toneInput: value })}
            onContinue={handleToneContinue}
            isLoading={state.isLoadingDiscovery}
          />
        );

      case 7:
        // Additional context step (optional)
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message={state.heartAnimationMessage}
              onComplete={handleHeartAnimationComplete}
            />
          );
        }
        return (
          <StepAdditional
            currentStep={7}
            question={state.step7Data?.question || ''}
            initialChips={state.step7Data?.initialChips || []}
            expandedChips={state.step7Data?.expandedChips || []}
            value={state.step7Input}
            onChange={(value) => updateState({ step7Input: value })}
            onContinue={handleAdditionalContinue}
            isLoading={state.isLoadingDiscovery}
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
      {/* Step content */}
      <div className="flex-1 flex items-center justify-center w-full">
        {renderStep()}
      </div>
    </div>
  );
}
