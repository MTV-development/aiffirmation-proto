'use client';

import { FO10_QUESTIONS } from '../types';
import { FragmentInput } from './fragment-input';

interface StepWhyProps {
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
 * Why step (Step 5) for FO-10 onboarding.
 *
 * Features:
 * - Question display with user's name
 * - Text input field
 * - LLM-generated hybrid fragments (ending with "...")
 * - 8 initial chips + 15 expanded chips
 * - Clicking a fragment appends it to the input field (fragment mode)
 */
export function StepWhy({
  currentStep,
  name,
  initialChips,
  expandedChips,
  value,
  onChange,
  onContinue,
  isLoading = false,
}: StepWhyProps) {
  if (currentStep !== 5) return null;

  // Get the question with name interpolation
  const question = FO10_QUESTIONS[1].replace('[name]', name);

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
    />
  );
}
