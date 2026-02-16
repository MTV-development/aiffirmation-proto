'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FO12_GOAL_QUESTION,
  type FO12OnboardingData,
  TARGET_LOVED,
  PHASE1_SIZE,
  PHASE2_SIZE,
} from '../types';
import { generateDiscoveryStep, generateAffirmationBatchFO12 } from '../actions';
import { useImplementation } from '@/src/fo-12';
import { StepWelcome } from './step-welcome';
import { StepFamiliarity } from './step-familiarity';
import { StepGoal } from './step-goal';
import { StepContext } from './step-context';
import { StepTone } from './step-tone';
import { StepStart } from './step-start';
import { HeartAnimation } from './heart-animation';
import { AffirmationCardFlow } from './affirmation-card-flow';
import { StepCheckin } from './step-checkin';
import { StepBackground } from './step-background';
import { StepNotifications } from './step-notifications';
import { StepPaywall } from './step-paywall';
import { StepCompletion } from './step-completion';

/**
 * FO-12 Onboarding state
 *
 * Flow phases:
 * - Steps 0-1: Welcome screens (2 sub-steps, no personalized welcome)
 * - Step 2: Familiarity selection (cosmetic only — not passed to agents)
 * - Step 3: Goal (predefined chips)
 * - Step 4: Context (LLM question + fragments, OR silently skipped)
 * - Step 5: Tone (LLM question + single-word chips)
 * - Step 6: Start screen (static, affirmations pre-loaded)
 * - Step 7: Phase 1 card review (10 affirmations)
 * - Step 8: Check-in 1 (static + loading for batch 2 generation)
 * - Step 9: Phase 2 card review (10 affirmations)
 * - Step 10: Check-in 2 (static + loading for batch 3 generation)
 * - Step 11: Phase 3 card review (continuous until 30 loved)
 * - Steps 12-14: Post-review mockups (background, notifications, paywall)
 * - Step 15: Completion screen (shows ALL 30 loved affirmations)
 */
export interface OnboardingState extends FO12OnboardingData {
  currentStep: number; // 0-15

  // Heart animation transition state
  showHeartAnimation: boolean;
  heartAnimationMessage: string;
  heartAnimationCompleted: boolean;

  // Discovery inputs (goal + context + tone)
  goalInput: { text: string };
  contextInput: { text: string };
  toneInput: { text: string };

  // Skip logic for step 4
  step4Skipped: boolean;

  // Discovery step data from LLM
  step4Data: { question: string; initialChips: string[]; expandedChips: string[] } | null;
  step5Data: { question: string; initialChips: string[]; expandedChips: string[] } | null;

  // Loading state for discovery steps
  isLoadingDiscovery: boolean;
  discoveryError: string | null;

  // Current phase (1, 2, or 3)
  currentPhase: 1 | 2 | 3;

  // Phase 3 pool management
  phase3Pool: string[];
  phase3PoolIndex: number;

  // Affirmation generation state
  isGenerating: boolean;
  generationError: string | null;
  batchNumber: number;
  currentBatchAffirmations: string[];

  // Accumulated across all phases
  allLovedAffirmations: string[];
  allDiscardedAffirmations: string[];
  allGeneratedAffirmations: string[];

  // Check-in loading states
  isCheckinLoading: boolean;

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
  step4Skipped: false,
  step4Data: null,
  step5Data: null,
  isLoadingDiscovery: false,
  discoveryError: null,
  currentPhase: 1,
  phase3Pool: [],
  phase3PoolIndex: 0,
  isGenerating: false,
  generationError: null,
  batchNumber: 1,
  currentBatchAffirmations: [],
  allLovedAffirmations: [],
  allDiscardedAffirmations: [],
  allGeneratedAffirmations: [],
  isCheckinLoading: false,
  selectedBackground: null,
  notificationFrequency: null,
};

/**
 * Main state manager component for FO-12 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions with heart animations
 * - Orchestrates 2 discovery steps with skip logic for step 4
 * - 3-phase structured selection flow: 10 + 10 + remaining until 30 loved
 * - Check-in screens between phases with generation during loading
 * - Phase 3 continuous mode with pool management and emergency generation
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
      currentStep: Math.min(prev.currentStep + 1, 15),
    }));
  }, []);

  // Handle familiarity selection and move to goal step
  const handleFamiliarityComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 3, // Go to step 3 (Goal)
    }));
  }, []);

  // Handle goal step (step 3) completion
  const handleGoalContinue = useCallback(() => {
    const goalQuestion = FO12_GOAL_QUESTION.replace('[name]', state.name);
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

    // Call discovery agent for step 4 during heart animation
    const context: FO12OnboardingData = {
      name: state.name,
      familiarityLevel: state.familiarityLevel,
      exchanges: newExchanges,
    };

    generateDiscoveryStep(4, context, implementation).then((result) => {
      if (result.error) {
        setState((prev) => ({
          ...prev,
          isLoadingDiscovery: false,
          discoveryError: result.error || 'Failed to load discovery step',
        }));
        return;
      }

      if (result.skip) {
        // Step 4 is skipped — immediately call discovery for step 5
        setState((prev) => ({
          ...prev,
          step4Skipped: true,
        }));

        generateDiscoveryStep(5, context, implementation).then((step5Result) => {
          if (step5Result.error) {
            setState((prev) => ({
              ...prev,
              isLoadingDiscovery: false,
              discoveryError: step5Result.error || 'Failed to load tone step',
            }));
            return;
          }

          setState((prev) => ({
            ...prev,
            isLoadingDiscovery: false,
            step5Data: {
              question: step5Result.question,
              initialChips: step5Result.initialChips,
              expandedChips: step5Result.expandedChips,
            },
          }));
        }).catch((error) => {
          console.error('[fo-12] Error fetching step 5 (after skip):', error);
          setState((prev) => ({
            ...prev,
            isLoadingDiscovery: false,
            discoveryError: 'An unexpected error occurred',
          }));
        });
      } else {
        // Step 4 not skipped — store step 4 data
        setState((prev) => ({
          ...prev,
          isLoadingDiscovery: false,
          step4Skipped: false,
          step4Data: {
            question: result.question,
            initialChips: result.initialChips,
            expandedChips: result.expandedChips,
          },
        }));
      }
    }).catch((error) => {
      console.error('[fo-12] Error fetching step 4:', error);
      setState((prev) => ({
        ...prev,
        isLoadingDiscovery: false,
        discoveryError: 'An unexpected error occurred',
      }));
    });
  }, [state.name, state.goalInput.text, state.familiarityLevel, implementation]);

  // Handle context step (step 4) completion
  const handleContextContinue = useCallback(() => {
    const contextExchange = {
      question: state.step4Data?.question || '',
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

    // Call discovery agent for step 5 during heart animation
    const context: FO12OnboardingData = {
      name: state.name,
      familiarityLevel: state.familiarityLevel,
      exchanges: newExchanges,
    };

    generateDiscoveryStep(5, context, implementation).then((result) => {
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
        step5Data: {
          question: result.question,
          initialChips: result.initialChips,
          expandedChips: result.expandedChips,
        },
      }));
    }).catch((error) => {
      console.error('[fo-12] Error fetching step 5:', error);
      setState((prev) => ({
        ...prev,
        isLoadingDiscovery: false,
        discoveryError: 'An unexpected error occurred',
      }));
    });
  }, [state.exchanges, state.step4Data, state.contextInput.text, state.name, state.familiarityLevel, implementation]);

  // Handle tone step (step 5) completion — generates first affirmation batch
  const handleToneContinue = useCallback(() => {
    const toneExchange = {
      question: state.step5Data?.question || '',
      answer: { text: state.toneInput.text },
    };

    const newExchanges = [...state.exchanges, toneExchange];

    // Show heart animation: "Creating your personalized affirmations..."
    setState((prev) => ({
      ...prev,
      exchanges: newExchanges,
      showHeartAnimation: true,
      heartAnimationMessage: `You have been doing great, ${prev.name}! We are creating your personalized affirmations.`,
      isGenerating: true,
      generationError: null,
    }));

    // Generate first batch of 10 affirmations during heart animation
    const context: FO12OnboardingData = {
      name: state.name,
      familiarityLevel: state.familiarityLevel,
      exchanges: newExchanges,
    };

    generateAffirmationBatchFO12({
      context,
      batchNumber: 1,
      approvedAffirmations: [],
      skippedAffirmations: [],
      implementation,
    }).then((result) => {
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
      }));
    }).catch((error) => {
      console.error('[fo-12] Error generating first batch:', error);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generationError: 'An unexpected error occurred',
      }));
    });
  }, [state.exchanges, state.step5Data, state.toneInput.text, state.name, state.familiarityLevel, implementation]);

  // Handle heart animation completion
  const handleHeartAnimationComplete = useCallback(() => {
    const currentStep = state.currentStep;

    if (currentStep === 3) {
      // After goal — check if discovery data is ready
      if (state.isLoadingDiscovery) {
        // Still loading — mark animation as completed, wait for data
        setState((prev) => ({
          ...prev,
          heartAnimationCompleted: true,
        }));
        return;
      }

      if (state.step4Skipped) {
        // Skip to step 5 (tone)
        setState((prev) => ({
          ...prev,
          showHeartAnimation: false,
          heartAnimationCompleted: false,
          currentStep: 5,
        }));
      } else {
        // Go to step 4 (context)
        setState((prev) => ({
          ...prev,
          showHeartAnimation: false,
          heartAnimationCompleted: false,
          currentStep: 4,
        }));
      }
    } else if (currentStep === 4) {
      // After context — check if step 5 data is ready
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
        currentStep: 5,
      }));
    } else if (currentStep === 5) {
      // After tone — check if first batch is ready
      if (state.isGenerating) {
        setState((prev) => ({
          ...prev,
          heartAnimationCompleted: true,
        }));
        return;
      }

      // First batch ready — go to Start screen (step 6)
      setState((prev) => ({
        ...prev,
        showHeartAnimation: false,
        heartAnimationCompleted: false,
        currentStep: 6,
      }));
    }
  }, [state.currentStep, state.isLoadingDiscovery, state.step4Skipped, state.isGenerating]);

  // Transition to next step when heart animation completed and data is ready
  useEffect(() => {
    if (state.heartAnimationCompleted && !state.discoveryError) {
      if (state.currentStep === 3 && !state.isLoadingDiscovery) {
        if (state.step4Skipped) {
          setState((prev) => ({
            ...prev,
            showHeartAnimation: false,
            heartAnimationCompleted: false,
            currentStep: 5,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            showHeartAnimation: false,
            heartAnimationCompleted: false,
            currentStep: 4,
          }));
        }
      } else if (state.currentStep === 4 && !state.isLoadingDiscovery) {
        setState((prev) => ({
          ...prev,
          showHeartAnimation: false,
          heartAnimationCompleted: false,
          currentStep: 5,
        }));
      } else if (state.currentStep === 5 && !state.isGenerating) {
        setState((prev) => ({
          ...prev,
          showHeartAnimation: false,
          heartAnimationCompleted: false,
          currentStep: 6,
        }));
      }
    }
  }, [
    state.heartAnimationCompleted,
    state.isLoadingDiscovery,
    state.isGenerating,
    state.discoveryError,
    state.currentStep,
    state.step4Skipped,
  ]);

  // Handle Phase 1 completion (step 7 → step 8)
  const handlePhase1Complete = useCallback(
    (loved: string[], discarded: string[]) => {
      setState((prev) => ({
        ...prev,
        allLovedAffirmations: [...prev.allLovedAffirmations, ...loved],
        allDiscardedAffirmations: [...prev.allDiscardedAffirmations, ...discarded],
        currentStep: 8, // Check-in 1
        currentPhase: 1,
      }));
    },
    []
  );

  // Handle Check-in 1 Continue → generate batch 2
  const handleCheckin1Continue = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isCheckinLoading: true,
    }));

    const context: FO12OnboardingData = {
      name: state.name,
      familiarityLevel: state.familiarityLevel,
      exchanges: state.exchanges,
    };

    generateAffirmationBatchFO12({
      context,
      batchNumber: 2,
      approvedAffirmations: state.allLovedAffirmations,
      skippedAffirmations: state.allDiscardedAffirmations,
      implementation,
    }).then((result) => {
      if (result.error) {
        console.error('[fo-12] Error generating batch 2:', result.error);
        setState((prev) => ({
          ...prev,
          isCheckinLoading: false,
          generationError: result.error || 'Failed to generate affirmations',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isCheckinLoading: false,
        batchNumber: 2,
        currentBatchAffirmations: result.affirmations,
        allGeneratedAffirmations: [...prev.allGeneratedAffirmations, ...result.affirmations],
        currentStep: 9, // Phase 2 card review
        currentPhase: 2,
      }));
    }).catch((error) => {
      console.error('[fo-12] Error generating batch 2:', error);
      setState((prev) => ({
        ...prev,
        isCheckinLoading: false,
        generationError: 'An unexpected error occurred',
      }));
    });
  }, [state.name, state.familiarityLevel, state.exchanges, state.allLovedAffirmations, state.allDiscardedAffirmations, implementation]);

  // Handle Phase 2 completion (step 9 → step 10)
  const handlePhase2Complete = useCallback(
    (loved: string[], discarded: string[]) => {
      setState((prev) => ({
        ...prev,
        allLovedAffirmations: [...prev.allLovedAffirmations, ...loved],
        allDiscardedAffirmations: [...prev.allDiscardedAffirmations, ...discarded],
        currentStep: 10, // Check-in 2
        currentPhase: 2,
      }));
    },
    []
  );

  // Handle Check-in 2 Continue → generate batch 3 (dynamic size)
  const handleCheckin2Continue = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isCheckinLoading: true,
    }));

    const totalLovedSoFar = state.allLovedAffirmations.length;
    const remaining = TARGET_LOVED - totalLovedSoFar;
    const dynamicBatchSize = Math.max(2 * remaining, 20);

    const context: FO12OnboardingData = {
      name: state.name,
      familiarityLevel: state.familiarityLevel,
      exchanges: state.exchanges,
    };

    generateAffirmationBatchFO12({
      context,
      batchNumber: 3,
      approvedAffirmations: state.allLovedAffirmations,
      skippedAffirmations: state.allDiscardedAffirmations,
      implementation,
      batchSize: dynamicBatchSize,
    }).then((result) => {
      if (result.error) {
        console.error('[fo-12] Error generating batch 3:', result.error);
        setState((prev) => ({
          ...prev,
          isCheckinLoading: false,
          generationError: result.error || 'Failed to generate affirmations',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isCheckinLoading: false,
        batchNumber: 3,
        phase3Pool: result.affirmations,
        phase3PoolIndex: 0,
        allGeneratedAffirmations: [...prev.allGeneratedAffirmations, ...result.affirmations],
        currentStep: 11, // Phase 3 card review
        currentPhase: 3,
      }));
    }).catch((error) => {
      console.error('[fo-12] Error generating batch 3:', error);
      setState((prev) => ({
        ...prev,
        isCheckinLoading: false,
        generationError: 'An unexpected error occurred',
      }));
    });
  }, [state.name, state.familiarityLevel, state.exchanges, state.allLovedAffirmations, state.allDiscardedAffirmations, implementation]);

  // Handle Phase 3 completion (30 loved reached)
  const handlePhase3Complete = useCallback(
    (loved: string[], discarded: string[]) => {
      setState((prev) => ({
        ...prev,
        allLovedAffirmations: [...prev.allLovedAffirmations, ...loved],
        allDiscardedAffirmations: [...prev.allDiscardedAffirmations, ...discarded],
        currentStep: 12, // Post-review: background
      }));
    },
    []
  );

  // Handle Phase 3 pool exhaustion — generate emergency batch
  const handlePhase3RequestMore = useCallback(() => {
    // Show loading in phase 3 (the card flow will be replaced)
    setState((prev) => ({
      ...prev,
      isGenerating: true,
    }));

    const totalLovedSoFar = state.allLovedAffirmations.length;
    const remaining = TARGET_LOVED - totalLovedSoFar;
    const dynamicBatchSize = Math.max(2 * remaining, 20);

    const context: FO12OnboardingData = {
      name: state.name,
      familiarityLevel: state.familiarityLevel,
      exchanges: state.exchanges,
    };

    generateAffirmationBatchFO12({
      context,
      batchNumber: state.batchNumber + 1,
      approvedAffirmations: state.allLovedAffirmations,
      skippedAffirmations: state.allDiscardedAffirmations,
      implementation,
      batchSize: dynamicBatchSize,
    }).then((result) => {
      if (result.error) {
        console.error('[fo-12] Error generating emergency batch:', result.error);
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
        batchNumber: prev.batchNumber + 1,
        phase3Pool: result.affirmations,
        phase3PoolIndex: 0,
        allGeneratedAffirmations: [...prev.allGeneratedAffirmations, ...result.affirmations],
      }));
    }).catch((error) => {
      console.error('[fo-12] Error generating emergency batch:', error);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generationError: 'An unexpected error occurred',
      }));
    });
  }, [state.name, state.familiarityLevel, state.exchanges, state.allLovedAffirmations, state.allDiscardedAffirmations, state.batchNumber, implementation]);

  // Render step content based on current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
      case 1:
        return (
          <StepWelcome
            currentStep={state.currentStep}
            name={state.name}
            onNameChange={(name) => updateState({ name })}
            onContinue={nextStep}
          />
        );

      case 2:
        return (
          <StepFamiliarity
            currentStep={2}
            name={state.name}
            familiarity={state.familiarityLevel}
            onFamiliarityChange={(familiarity) => updateState({ familiarityLevel: familiarity })}
            onContinue={handleFamiliarityComplete}
          />
        );

      case 3:
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
            currentStep={3}
            name={state.name}
            value={state.goalInput}
            onChange={(value) => updateState({ goalInput: value })}
            onContinue={handleGoalContinue}
          />
        );

      case 4:
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
            currentStep={4}
            name={state.name}
            question={state.step4Data?.question || ''}
            initialChips={state.step4Data?.initialChips || []}
            expandedChips={state.step4Data?.expandedChips || []}
            value={state.contextInput}
            onChange={(value) => updateState({ contextInput: value })}
            onContinue={handleContextContinue}
            isLoading={state.isLoadingDiscovery}
          />
        );

      case 5:
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
            currentStep={5}
            name={state.name}
            question={state.step5Data?.question || ''}
            initialChips={state.step5Data?.initialChips || []}
            expandedChips={state.step5Data?.expandedChips || []}
            value={state.toneInput}
            onChange={(value) => updateState({ toneInput: value })}
            onContinue={handleToneContinue}
            isLoading={state.isLoadingDiscovery}
          />
        );

      case 6:
        // Start screen (affirmations pre-loaded)
        return (
          <StepStart
            onContinue={() => updateState({ currentStep: 7 })}
            name={state.name}
          />
        );

      case 7:
        // Phase 1: Card review (10 affirmations)
        return (
          <AffirmationCardFlow
            affirmations={state.currentBatchAffirmations}
            onComplete={handlePhase1Complete}
            totalLovedSoFar={0}
            target={TARGET_LOVED}
          />
        );

      case 8:
        // Check-in 1
        return (
          <StepCheckin
            phase={1}
            onContinue={handleCheckin1Continue}
            isLoading={state.isCheckinLoading}
          />
        );

      case 9:
        // Phase 2: Card review (10 affirmations)
        return (
          <AffirmationCardFlow
            affirmations={state.currentBatchAffirmations}
            onComplete={handlePhase2Complete}
            totalLovedSoFar={state.allLovedAffirmations.length}
            target={TARGET_LOVED}
          />
        );

      case 10:
        // Check-in 2
        return (
          <StepCheckin
            phase={2}
            onContinue={handleCheckin2Continue}
            isLoading={state.isCheckinLoading}
          />
        );

      case 11:
        // Phase 3: Continuous card review until 30 loved
        if (state.isGenerating) {
          return (
            <div className="flex flex-col h-full items-center justify-center p-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Generating more affirmations...
              </p>
            </div>
          );
        }

        if (state.generationError) {
          return (
            <div className="flex flex-col h-full items-center justify-center p-8 text-center">
              <p className="text-red-500 mb-4">{state.generationError}</p>
              <button
                onClick={handlePhase3RequestMore}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
            </div>
          );
        }

        return (
          <AffirmationCardFlow
            affirmations={state.phase3Pool}
            onComplete={handlePhase3Complete}
            totalLovedSoFar={state.allLovedAffirmations.length}
            target={TARGET_LOVED}
            onRequestMore={handlePhase3RequestMore}
          />
        );

      case 12:
        return <StepBackground onContinue={nextStep} />;

      case 13:
        return <StepNotifications onContinue={nextStep} />;

      case 14:
        return <StepPaywall onContinue={nextStep} />;

      case 15:
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
