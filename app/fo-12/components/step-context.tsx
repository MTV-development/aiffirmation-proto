'use client';

import { FragmentInput } from './fragment-input';

interface StepContextProps {
  currentStep: number;
  name: string;
  question: string;
  initialChips: string[];
  expandedChips: string[];
  value: { text: string };
  onChange: (value: { text: string }) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

/**
 * Context step (Step 4) for FO-12 onboarding.
 *
 * This step may be skipped by the discovery agent if the user's goal answer
 * already provides sufficient life context. When shown, it displays an
 * LLM-generated question with hybrid fragment chips (ending with "...").
 *
 * Features:
 * - LLM-generated question (passed via props, not from a constants file)
 * - Text input field
 * - LLM-generated hybrid fragments (ending with "...")
 * - 8 initial chips + 15 expanded chips
 * - Clicking a fragment appends it to the input field (fragment mode)
 */
export function StepContext({
  currentStep,
  name,
  question,
  initialChips,
  expandedChips,
  value,
  onChange,
  onContinue,
  isLoading = false,
}: StepContextProps) {
  if (currentStep !== 4) return null;

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
