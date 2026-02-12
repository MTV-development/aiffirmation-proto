'use client';

import { FragmentInput } from './fragment-input';

interface StepAdditionalProps {
  currentStep: number;
  question: string;
  initialChips: string[];
  expandedChips: string[];
  value: { text: string };
  onChange: (value: { text: string }) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

/**
 * Additional context step (Step 7) for FO-11 onboarding.
 *
 * This is a final, optional step that captures any remaining nuance,
 * struggles, or friction points before generating affirmations.
 * Uses fragment chips (ending with "...") like step 5.
 * The continue button is always enabled (optional step).
 */
export function StepAdditional({
  currentStep,
  question,
  initialChips,
  expandedChips,
  value,
  onChange,
  onContinue,
  isLoading = false,
}: StepAdditionalProps) {
  if (currentStep !== 7) return null;

  return (
    <FragmentInput
      question={question}
      initialFragments={initialChips}
      expandedFragments={expandedChips}
      value={value}
      onChange={onChange}
      onContinue={onContinue}
      isLoading={isLoading}
      mode="fragments"
      optional={true}
    />
  );
}
