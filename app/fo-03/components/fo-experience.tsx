'use client';

import { useState, useCallback } from 'react';
import { StepWelcome } from './step-welcome';

/**
 * FO-03 Onboarding data collected during the flow.
 * All fields except `name` can be empty/skipped.
 */
export interface FO03OnboardingData {
  name: string;
  familiarity: 'new' | 'some' | 'very' | null;
  topics: string[];
  situation: { text: string; chips: string[] };
  feelings: { text: string; chips: string[] };
  whatHelps: { text: string; chips: string[] };
}

/**
 * FO-03 Onboarding state
 * Steps 0-13 guide user through the full onboarding flow
 *
 * Key differences from FO-02:
 * - Gradual multi-question onboarding (familiarity, topics, situation, feelings, whatHelps)
 * - Toggleable chips alongside open text fields
 * - Richer context for better affirmation generation
 */
export interface OnboardingState extends FO03OnboardingData {
  currentStep: number; // 0-13

  // Batch generation
  currentBatch: string[];
  currentBatchNumber: number;
  isGenerating: boolean;
  generationError: string | null;

  // Swipe state
  currentCardIndex: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];

  // Illustrative choices
  selectedBackground: string | null;
  notificationFrequency: number | null;
}

const initialState: OnboardingState = {
  currentStep: 0,
  name: '',
  familiarity: null,
  topics: [],
  situation: { text: '', chips: [] },
  feelings: { text: '', chips: [] },
  whatHelps: { text: '', chips: [] },
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
 * Main state manager component for FO-03 onboarding experience.
 *
 * Responsibilities:
 * - Manages all onboarding state
 * - Renders correct step component based on currentStep
 * - Handles step transitions
 * - Calls server action to generate batches of affirmations with feedback
 * - No persistence - state resets on refresh
 *
 * Key differences from FO-02:
 * - Collects richer context (familiarity, topics, situation, feelings, whatHelps)
 * - Each context field can have both free text and chip selections
 * - Uses this context for more personalized affirmation generation
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
      if (step >= 0 && step <= 13) {
        updateState({ currentStep: step });
      }
    },
    [updateState]
  );

  // Navigate to next step
  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 13),
    }));
  }, []);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
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
        // Familiarity step - placeholder
        return (
          <div className="text-center p-8">
            <p className="text-gray-500">Step 3: Familiarity (TODO)</p>
            <button
              onClick={nextStep}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Continue
            </button>
          </div>
        );

      case 4:
        // Topics multi-select step - placeholder
        return (
          <div className="text-center p-8">
            <p className="text-gray-500">Step 4: Topics (TODO)</p>
            <button
              onClick={nextStep}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Continue
            </button>
          </div>
        );

      case 5:
        // What's going on step - placeholder
        return (
          <div className="text-center p-8">
            <p className="text-gray-500">Step 5: Situation (TODO)</p>
            <button
              onClick={nextStep}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Continue
            </button>
          </div>
        );

      case 6:
        // Current feelings step - placeholder
        return (
          <div className="text-center p-8">
            <p className="text-gray-500">Step 6: Feelings (TODO)</p>
            <button
              onClick={nextStep}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Continue
            </button>
          </div>
        );

      case 7:
        // What helps step - placeholder
        return (
          <div className="text-center p-8">
            <p className="text-gray-500">Step 7: What Helps (TODO)</p>
            <button
              onClick={nextStep}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Continue
            </button>
          </div>
        );

      case 8:
      case 9:
        // Swipe phase steps - placeholder
        return (
          <div className="text-center p-8">
            <p className="text-gray-500">Step {state.currentStep}: Swipe Phase (TODO)</p>
            <button
              onClick={nextStep}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Continue
            </button>
          </div>
        );

      case 10:
        // Background selection - placeholder
        return (
          <div className="text-center p-8">
            <p className="text-gray-500">Step 10: Background (TODO)</p>
            <button
              onClick={nextStep}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Continue
            </button>
          </div>
        );

      case 11:
        // Notifications - placeholder
        return (
          <div className="text-center p-8">
            <p className="text-gray-500">Step 11: Notifications (TODO)</p>
            <button
              onClick={nextStep}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Continue
            </button>
          </div>
        );

      case 12:
        // Light paywall - placeholder
        return (
          <div className="text-center p-8">
            <p className="text-gray-500">Step 12: Paywall (TODO)</p>
            <button
              onClick={nextStep}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Continue
            </button>
          </div>
        );

      case 13:
        // Finish - placeholder
        return (
          <div className="text-center p-8">
            <p className="text-gray-500">Step 13: Finish (TODO)</p>
            <p className="text-sm text-gray-400 mt-2">
              Name: {state.name || '(not set)'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      {/* Progress indicator for steps 1-12 */}
      {state.currentStep > 0 && state.currentStep < 13 && (
        <div className="w-full max-w-md px-8 pt-8">
          <div className="flex gap-1">
            {Array.from({ length: 12 }, (_, i) => (
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
