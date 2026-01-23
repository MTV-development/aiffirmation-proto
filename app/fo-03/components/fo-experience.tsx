'use client';

import { useState, useCallback } from 'react';
import { StepWelcome } from './step-welcome';
import { StepFamiliarity } from './step-familiarity';
import { StepTopics } from './step-topics';
import { TextWithChips } from './text-with-chips';
import { HeartAnimation } from './heart-animation';

// Step 5 - Situation chips
const SITUATION_PRIMARY_CHIPS = [
  'Feeling stuck',
  'Relationship issues',
  'Career issues',
  'Life changes',
  'Want growth',
  'Self-care reset',
  'Just curious',
];
const SITUATION_MORE_CHIPS = [
  'Burnout',
  'Big change',
  'Loneliness',
  'Work pressure',
  'Sleep problems',
  'Motivation loss',
  'Need calm',
  'Need clarity',
  'Want support',
  'Hard day',
  'Hard week',
  'Something happened',
  'No clear reason',
  'Stress',
  'Balance',
  'Time pressure',
  'Energy',
  'Motivation',
  'Purpose',
  'Direction',
  'Expectations',
  'Changes',
  'Decisions',
  'Responsibility',
  'Personal growth',
  'Rest',
  'Sleep',
  'Focus',
  'Boundaries',
  'Overthinking',
  'Emotions',
  'Mental health',
];

// Step 6 - Feelings chips
const FEELINGS_PRIMARY_CHIPS = [
  'Stressed',
  'Motivated',
  'Anxious',
  'Sad',
  'Restless',
  'Vulnerable',
  'Tired',
  'Excited',
  'Lonely',
  'Frustrated',
];
const FEELINGS_MORE_CHIPS = [
  'Hopeful',
  'Calm',
  'Overwhelmed',
  'Confident',
  'Grateful',
  'Happy',
  'Irritable',
  'Peaceful',
  'Content',
  'Focused',
  'Burned out',
  'Joyful',
  'Insecure',
  'Relaxed',
  'Angry',
];

// Step 7 - What helps chips
const WHAT_HELPS_PRIMARY_CHIPS = [
  'Rest',
  'Music',
  'Movement',
  'Nature',
  'Being alone',
  'Being with others',
  'Feeling understood',
  'Being reassured',
  'Taking a break',
];
const WHAT_HELPS_MORE_CHIPS = [
  'Routine',
  'Creativity',
  'Deep breaths',
  'Kind words',
  'Quiet time',
  'Laughter',
  'Letting go',
  'Slowing down',
  'Small wins',
  'Feeling safe',
];

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

  // Heart animation transition state (between steps 5->6 and 6->7)
  showHeartAnimation: boolean;

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
  showHeartAnimation: false,
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
        return (
          <StepFamiliarity
            currentStep={state.currentStep}
            name={state.name}
            familiarity={state.familiarity}
            onFamiliarityChange={(familiarity) => updateState({ familiarity })}
            onContinue={nextStep}
          />
        );

      case 4:
        return (
          <StepTopics
            currentStep={state.currentStep}
            name={state.name}
            topics={state.topics}
            onTopicsChange={(topics) => updateState({ topics })}
            onContinue={nextStep}
            onSkip={nextStep}
          />
        );

      case 5:
        // What's going on step - situation with open text + chips
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message="You are doing great - the more you write the better affirmations!"
              onComplete={() => {
                updateState({ showHeartAnimation: false });
                nextStep();
              }}
            />
          );
        }
        return (
          <TextWithChips
            headline={`What has been going on lately that brought you here, ${state.name}?`}
            placeholder="Write freely or pick from below..."
            primaryChips={SITUATION_PRIMARY_CHIPS}
            moreChips={SITUATION_MORE_CHIPS}
            value={state.situation}
            onChange={(situation) => updateState({ situation })}
            onContinue={() => updateState({ showHeartAnimation: true })}
            onNotSure={nextStep}
          />
        );

      case 6:
        // Current feelings step - feelings with open text + chips
        if (state.showHeartAnimation) {
          return (
            <HeartAnimation
              message={`You have been doing great, ${state.name}! We are creating your personalized affirmations.`}
              onComplete={() => {
                updateState({ showHeartAnimation: false });
                nextStep();
              }}
            />
          );
        }
        return (
          <TextWithChips
            headline="What are you feeling right now?"
            placeholder="Write freely or pick from below..."
            primaryChips={FEELINGS_PRIMARY_CHIPS}
            moreChips={FEELINGS_MORE_CHIPS}
            value={state.feelings}
            onChange={(feelings) => updateState({ feelings })}
            onContinue={() => updateState({ showHeartAnimation: true })}
            onNotSure={nextStep}
          />
        );

      case 7:
        // What helps step - with open text + chips, no heart animation after
        return (
          <TextWithChips
            headline="What normally makes you feel good?"
            placeholder="Write freely or pick from below..."
            primaryChips={WHAT_HELPS_PRIMARY_CHIPS}
            moreChips={WHAT_HELPS_MORE_CHIPS}
            value={state.whatHelps}
            onChange={(whatHelps) => updateState({ whatHelps })}
            onContinue={nextStep}
            onNotSure={nextStep}
          />
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
