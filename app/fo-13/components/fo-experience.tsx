'use client';

import { useState, useCallback } from 'react';
import {
  FO13_GOAL_QUESTION,
  type FO13OnboardingData,
  PHASE1_BATCH_SIZE,
} from '../types';
import { generateDiscoveryStep, generateAffirmationBatchFO13 } from '../actions';
import { useImplementation } from '@/src/fo-13';
import { StepWelcome } from './step-welcome';
import { StepFamiliarity } from './step-familiarity';
import { StepGoal } from './step-goal';
import { StepContext } from './step-context';
import { StepTone } from './step-tone';
import { ThinkingScreen } from './thinking-screen';

/**
 * FO-13 Onboarding state machine — partial (discovery + first batch)
 *
 * Flow:
 * - Steps 0-1: Welcome screens (name entry)
 * - Step 2: Familiarity selection (cosmetic only)
 * - Step 3: Goal (predefined chips)
 * - Thinking A: "Thank you for sharing, {name}..." → "Shaping affirmations to align with you..."
 * - Step 4: Context (LLM question + fragments, OR silently skipped)
 * - Thinking B: "Learning..." → "Your affirmations are taking shape..."
 * - Step 5: Tone (LLM question + single-word chips)
 * - Thinking C: "Thank you for sharing, {name}..." → "Creating affirmations that feel true..."
 *   (first batch of 5 generated during Thinking C)
 * - Step 6: Placeholder for phase 1 (wired in iteration 02.2)
 *
 * Thinking screens use ThinkingScreen (sequential messages with pulsing heart),
 * replacing FO-12's simple HeartAnimation for these transitions.
 */
export interface OnboardingState extends FO13OnboardingData {
  currentStep: number; // 0-6 (partial, will expand to full flow)

  // Thinking screen transition state
  showThinkingScreen: boolean;
  thinkingMessages: string[];
  thinkingCompleted: boolean;

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

  // Affirmation generation state
  isGenerating: boolean;
  generationError: string | null;
  batchNumber: number;
  currentBatchAffirmations: string[];

  // Accumulated across all phases (partial — only first batch in this iteration)
  allLovedAffirmations: string[];
  allDiscardedAffirmations: string[];
  allGeneratedAffirmations: string[];
}

const initialState: OnboardingState = {
  currentStep: 0,
  name: '',
  familiarityLevel: 'somewhat',
  exchanges: [],
  showThinkingScreen: false,
  thinkingMessages: [],
  thinkingCompleted: false,
  goalInput: { text: '' },
  contextInput: { text: '' },
  toneInput: { text: '' },
  step4Skipped: false,
  step4Data: null,
  step5Data: null,
  isLoadingDiscovery: false,
  discoveryError: null,
  isGenerating: false,
  generationError: null,
  batchNumber: 1,
  currentBatchAffirmations: [],
  allLovedAffirmations: [],
  allDiscardedAffirmations: [],
  allGeneratedAffirmations: [],
};

/**
 * Main state manager component for FO-13 onboarding experience.
 *
 * Partial implementation covering discovery flow + first batch generation.
 * Phase 1 card review, phase 2, and post-review screens will be added in iteration 02.2/02.3.
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
      currentStep: prev.currentStep + 1,
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
  // Shows Thinking A, calls discovery agent for step 4 during thinking
  const handleGoalContinue = useCallback(() => {
    const goalQuestion = FO13_GOAL_QUESTION.replace('[name]', state.name);
    const goalExchange = {
      question: goalQuestion,
      answer: { text: state.goalInput.text },
    };

    const newExchanges = [goalExchange];

    // Show Thinking A: "Thank you for sharing, {name}..." → "Shaping affirmations..."
    setState((prev) => ({
      ...prev,
      exchanges: newExchanges,
      showThinkingScreen: true,
      thinkingMessages: [
        `Thank you for sharing, ${prev.name}...`,
        'Shaping affirmations to align with you...',
      ],
      isLoadingDiscovery: true,
      discoveryError: null,
    }));

    // Call discovery agent for step 4 during thinking screen
    const context: FO13OnboardingData = {
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
            // If thinking already finished, advance to tone (step 5)
            ...(prev.thinkingCompleted ? {
              showThinkingScreen: false,
              thinkingCompleted: false,
              currentStep: 5,
            } : {}),
          }));
        }).catch((error) => {
          console.error('[fo-13] Error fetching step 5 (after skip):', error);
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
          // If thinking already finished, advance to context (step 4)
          ...(prev.thinkingCompleted ? {
            showThinkingScreen: false,
            thinkingCompleted: false,
            currentStep: 4,
          } : {}),
        }));
      }
    }).catch((error) => {
      console.error('[fo-13] Error fetching step 4:', error);
      setState((prev) => ({
        ...prev,
        isLoadingDiscovery: false,
        discoveryError: 'An unexpected error occurred',
      }));
    });
  }, [state.name, state.goalInput.text, state.familiarityLevel, implementation]);

  // Handle context step (step 4) completion
  // Shows Thinking B, calls discovery agent for step 5 during thinking
  const handleContextContinue = useCallback(() => {
    const contextExchange = {
      question: state.step4Data?.question || '',
      answer: { text: state.contextInput.text },
    };

    const newExchanges = [...state.exchanges, contextExchange];

    // Show Thinking B: "Learning..." → "Your affirmations are taking shape..."
    setState((prev) => ({
      ...prev,
      exchanges: newExchanges,
      showThinkingScreen: true,
      thinkingMessages: [
        'Learning...',
        'Your affirmations are taking shape...',
      ],
      isLoadingDiscovery: true,
      discoveryError: null,
    }));

    // Call discovery agent for step 5 during thinking screen
    const context: FO13OnboardingData = {
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
        // If thinking already finished, advance to tone (step 5)
        ...(prev.thinkingCompleted ? {
          showThinkingScreen: false,
          thinkingCompleted: false,
          currentStep: 5,
        } : {}),
      }));
    }).catch((error) => {
      console.error('[fo-13] Error fetching step 5:', error);
      setState((prev) => ({
        ...prev,
        isLoadingDiscovery: false,
        discoveryError: 'An unexpected error occurred',
      }));
    });
  }, [state.exchanges, state.step4Data, state.contextInput.text, state.name, state.familiarityLevel, implementation]);

  // Handle tone step (step 5) completion — generates first affirmation batch of 5
  // Shows Thinking C during generation
  const handleToneContinue = useCallback(() => {
    const toneExchange = {
      question: state.step5Data?.question || '',
      answer: { text: state.toneInput.text },
    };

    const newExchanges = [...state.exchanges, toneExchange];

    // Show Thinking C: "Thank you for sharing, {name}..." → "Creating affirmations that feel true..."
    setState((prev) => ({
      ...prev,
      exchanges: newExchanges,
      showThinkingScreen: true,
      thinkingMessages: [
        `Thank you for sharing, ${prev.name}...`,
        'Creating affirmations that feel true...',
      ],
      isGenerating: true,
      generationError: null,
    }));

    // Generate first batch of 5 affirmations during thinking screen
    const context: FO13OnboardingData = {
      name: state.name,
      familiarityLevel: state.familiarityLevel,
      exchanges: newExchanges,
    };

    generateAffirmationBatchFO13({
      context,
      batchNumber: 1,
      approvedAffirmations: [],
      skippedAffirmations: [],
      implementation,
      batchSize: PHASE1_BATCH_SIZE,
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
        // If thinking already finished, advance to step 6 (phase 1 placeholder)
        ...(prev.thinkingCompleted ? {
          showThinkingScreen: false,
          thinkingCompleted: false,
          currentStep: 6,
        } : {}),
      }));
    }).catch((error) => {
      console.error('[fo-13] Error generating first batch:', error);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generationError: 'An unexpected error occurred',
      }));
    });
  }, [state.exchanges, state.step5Data, state.toneInput.text, state.name, state.familiarityLevel, implementation]);

  // Handle thinking screen completion
  const handleThinkingComplete = useCallback(() => {
    const currentStep = state.currentStep;

    if (currentStep === 3) {
      // After goal (Thinking A) — check if discovery data is ready
      if (state.isLoadingDiscovery) {
        // Still loading — mark thinking as completed, wait for data
        setState((prev) => ({
          ...prev,
          thinkingCompleted: true,
        }));
        return;
      }

      if (state.step4Skipped) {
        // Skip to step 5 (tone)
        setState((prev) => ({
          ...prev,
          showThinkingScreen: false,
          thinkingCompleted: false,
          currentStep: 5,
        }));
      } else {
        // Go to step 4 (context)
        setState((prev) => ({
          ...prev,
          showThinkingScreen: false,
          thinkingCompleted: false,
          currentStep: 4,
        }));
      }
    } else if (currentStep === 4) {
      // After context (Thinking B) — check if step 5 data is ready
      if (state.isLoadingDiscovery) {
        setState((prev) => ({
          ...prev,
          thinkingCompleted: true,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        showThinkingScreen: false,
        thinkingCompleted: false,
        currentStep: 5,
      }));
    } else if (currentStep === 5) {
      // After tone (Thinking C) — check if first batch is ready
      if (state.isGenerating) {
        setState((prev) => ({
          ...prev,
          thinkingCompleted: true,
        }));
        return;
      }

      // First batch ready — go to step 6 (placeholder for phase 1)
      setState((prev) => ({
        ...prev,
        showThinkingScreen: false,
        thinkingCompleted: false,
        currentStep: 6,
      }));
    }
  }, [state.currentStep, state.isLoadingDiscovery, state.step4Skipped, state.isGenerating]);

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
        if (state.showThinkingScreen) {
          return (
            <ThinkingScreen
              messages={state.thinkingMessages}
              onComplete={handleThinkingComplete}
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
        if (state.showThinkingScreen) {
          return (
            <ThinkingScreen
              messages={state.thinkingMessages}
              onComplete={handleThinkingComplete}
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
        if (state.showThinkingScreen) {
          return (
            <ThinkingScreen
              messages={state.thinkingMessages}
              onComplete={handleThinkingComplete}
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
        // Placeholder: Phase 1 card review will be wired in iteration 02.2
        return (
          <div className="max-w-md mx-auto p-8 text-center">
            <h2 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
              Discovery Complete
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {state.currentBatchAffirmations.length} affirmations generated for your first batch.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Phase 1 card review will be connected in iteration 02.2.
            </p>
          </div>
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
