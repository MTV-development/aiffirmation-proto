'use client';

import { useState } from 'react';
import { ProgressBar } from './progress-bar';
import { StepFocus } from './step-focus';
import { StepTiming } from './step-timing';
import { StepChallenges } from './step-challenges';
import { StepTone } from './step-tone';
import {
  STEP_TITLES,
  STEP_DESCRIPTIONS,
  FOCUS_AREAS,
  TIMING_OPTIONS,
  CHALLENGE_BADGES,
  TONE_CARDS,
} from '@/src/full-process';
import type { UserPreferences, DiscoveryStepNumber } from '@/src/full-process';

interface DiscoveryWizardProps {
  /** Callback when wizard is complete with finalized preferences */
  onComplete: (preferences: UserPreferences) => void;
  /** Loading state during generation */
  isLoading?: boolean;
}

interface StepState {
  focus: { preset: string | null; custom: string };
  timing: { presets: string[]; custom: string };
  challenges: { presets: string[]; custom: string };
  tone: { preset: string | null; custom: string };
}

const initialStepState: StepState = {
  focus: { preset: null, custom: '' },
  timing: { presets: [], custom: '' },
  challenges: { presets: [], custom: '' },
  tone: { preset: null, custom: '' },
};

/**
 * 4-step discovery wizard for collecting user preferences
 */
export function DiscoveryWizard({ onComplete, isLoading = false }: DiscoveryWizardProps) {
  const [currentStep, setCurrentStep] = useState<DiscoveryStepNumber>(1);
  const [stepState, setStepState] = useState<StepState>(initialStepState);

  // Validation: check if current step has valid input
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        // Focus: must have preset OR custom text
        return !!(stepState.focus.preset || stepState.focus.custom.trim());
      case 2:
        // Timing: must have at least one preset OR custom text
        return !!(stepState.timing.presets.length > 0 || stepState.timing.custom.trim());
      case 3:
        // Challenges: always valid (optional step)
        return true;
      case 4:
        // Tone: must have preset OR custom text
        return !!(stepState.tone.preset || stepState.tone.custom.trim());
      default:
        return false;
    }
  };

  // Get label for preset ID
  const getPresetLabel = (presets: Array<{ id: string; label: string }>, id: string): string => {
    return presets.find((p) => p.id === id)?.label ?? id;
  };

  // Build final preferences from step state
  const buildPreferences = (): UserPreferences => {
    // Focus: use preset label or custom text
    const focus = stepState.focus.preset
      ? getPresetLabel(FOCUS_AREAS, stepState.focus.preset)
      : stepState.focus.custom.trim();

    // Timing: combine preset labels and custom text
    const timing: string[] = [
      ...stepState.timing.presets.map((id) => getPresetLabel(TIMING_OPTIONS, id)),
      ...(stepState.timing.custom.trim() ? [stepState.timing.custom.trim()] : []),
    ];

    // Challenges: combine preset labels and custom text
    const challenges: string[] = [
      ...stepState.challenges.presets.map((id) => getPresetLabel(CHALLENGE_BADGES, id)),
      ...(stepState.challenges.custom.trim() ? [stepState.challenges.custom.trim()] : []),
    ];

    // Tone: use preset label or custom text
    const tone = stepState.tone.preset
      ? getPresetLabel(TONE_CARDS, stepState.tone.preset)
      : stepState.tone.custom.trim();

    return { focus, timing, challenges, tone };
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as DiscoveryStepNumber);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as DiscoveryStepNumber);
    }
  };

  const handleSubmit = () => {
    if (isStepValid()) {
      onComplete(buildPreferences());
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepFocus
            selectedPreset={stepState.focus.preset}
            customText={stepState.focus.custom}
            onPresetChange={(preset) =>
              setStepState((prev) => ({ ...prev, focus: { ...prev.focus, preset } }))
            }
            onCustomChange={(custom) =>
              setStepState((prev) => ({ ...prev, focus: { ...prev.focus, custom } }))
            }
          />
        );
      case 2:
        return (
          <StepTiming
            selectedPresets={stepState.timing.presets}
            customText={stepState.timing.custom}
            onPresetsChange={(presets) =>
              setStepState((prev) => ({ ...prev, timing: { ...prev.timing, presets } }))
            }
            onCustomChange={(custom) =>
              setStepState((prev) => ({ ...prev, timing: { ...prev.timing, custom } }))
            }
          />
        );
      case 3:
        return (
          <StepChallenges
            selectedPresets={stepState.challenges.presets}
            customText={stepState.challenges.custom}
            onPresetsChange={(presets) =>
              setStepState((prev) => ({ ...prev, challenges: { ...prev.challenges, presets } }))
            }
            onCustomChange={(custom) =>
              setStepState((prev) => ({ ...prev, challenges: { ...prev.challenges, custom } }))
            }
          />
        );
      case 4:
        return (
          <StepTone
            selectedPreset={stepState.tone.preset}
            customText={stepState.tone.custom}
            onPresetChange={(preset) =>
              setStepState((prev) => ({ ...prev, tone: { ...prev.tone, preset } }))
            }
            onCustomChange={(custom) =>
              setStepState((prev) => ({ ...prev, tone: { ...prev.tone, custom } }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <ProgressBar current={currentStep} total={4} label="Step" className="mb-8" />

      {/* Step header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">{STEP_TITLES[currentStep]}</h2>
        <p className="text-gray-600 dark:text-gray-400">{STEP_DESCRIPTIONS[currentStep]}</p>
      </div>

      {/* Step content */}
      <div className="mb-8">{renderCurrentStep()}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6 py-3 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isStepValid() || isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Find Affirmations'}
          </button>
        )}
      </div>
    </div>
  );
}
