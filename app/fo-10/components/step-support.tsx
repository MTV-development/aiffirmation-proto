'use client';

import { FO10_QUESTIONS } from '../types';
import { FragmentInput } from './fragment-input';

interface StepSupportProps {
  currentStep: number;
  name: string;
  initialChips: string[];
  expandedChips: string[];
  value: { text: string };
  onChange: (value: { text: string }) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

/**
 * Support tone step (Step 7) for FO-10 onboarding.
 *
 * Features:
 * - Question display with user's name
 * - Text input field
 * - LLM-generated complete sentences about tone/style of support
 * - 8 initial chips + 15 expanded chips
 * - Clicking a sentence appends it to the input field (sentence mode)
 */
export function StepSupport({
  currentStep,
  name,
  initialChips,
  expandedChips,
  value,
  onChange,
  onContinue,
  isLoading = false,
}: StepSupportProps) {
  if (currentStep !== 7) return null;

  // Get the question with name interpolation
  const question = FO10_QUESTIONS[3].replace('[name]', name);

  return (
    <FragmentInput
      question={question}
      initialFragments={initialChips}
      expandedFragments={expandedChips}
      value={value}
      onChange={onChange}
      onContinue={onContinue}
      isLoading={isLoading}
      mode="sentences"
    />
  );
}
