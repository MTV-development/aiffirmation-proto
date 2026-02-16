'use client';

import { FragmentInput } from './fragment-input';

interface StepToneProps {
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
 * Tone step (Step 5) for FO-12 onboarding.
 *
 * Always shown (never skipped). Displays an LLM-generated question about
 * the user's preferred support tone with single-word chip suggestions.
 *
 * Features:
 * - LLM-generated question (passed via props, not from a constants file)
 * - Text input field
 * - LLM-generated single-word chips describing tone qualities
 * - 8 initial chips + 12 expanded chips (20 total)
 * - Clicking a word appends it to the input field (words mode)
 * - Helper text: "For example: calm, motivational, gentle, clear..."
 */
export function StepTone({
  currentStep,
  name,
  question,
  initialChips,
  expandedChips,
  value,
  onChange,
  onContinue,
  isLoading = false,
}: StepToneProps) {
  if (currentStep !== 5) return null;

  return (
    <FragmentInput
      question={question}
      initialFragments={initialChips}
      expandedFragments={expandedChips}
      value={value}
      onChange={onChange}
      onContinue={onContinue}
      isLoading={isLoading}
      mode="words"
      helperText="For example: calm, motivational, gentle, clear..."
    />
  );
}
