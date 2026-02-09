'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FO10_QUESTIONS } from '../types';

interface StepGoalProps {
  currentStep: number;
  name: string;
  value: { text: string };
  onChange: (value: { text: string }) => void;
  onContinue: () => void;
}

const TOPIC_OPTIONS = [
  'Motivation',
  'Focus',
  'Inner peace',
  'Energy boost',
  'Better sleep',
  'Body peace',
  'Self-worth',
  'Boundaries',
  'Letting go',
  'Healing',
  'Gratitude',
  'Positivity',
  'Resilience',
  'Anxiety relief',
  'Stress relief',
  'Courage',
  'Hope',
  'Joy',
  'Patience',
  'Mindfulness',
  'Self-care',
  'Forgiveness',
  'Connection',
  'Self-love',
  'Breakup healing',
  'Impulse control',
  'Digital detox',
  'Productivity',
  'Morning boost',
  'Night calm',
  'Confidence',
  'Calm',
  'Self-discipline',
  'Overthinking',
  'Grief',
  'Loneliness',
];

/**
 * Goal step (Step 4) for FO-10 onboarding.
 *
 * Features:
 * - Question display with user's name
 * - Prominent text input field
 * - Predefined topic chips (same as FO-09)
 * - Clicking a chip appends the topic text to the input field
 * - Continue button enabled only when text is entered
 */
export function StepGoal({
  currentStep,
  name,
  value,
  onChange,
  onContinue,
}: StepGoalProps) {
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  if (currentStep !== 4) return null;

  // Determine if Continue button should be enabled
  const canContinue = hasUserTyped && value.text.trim().length > 0;

  // Get the question with name interpolation
  const question = FO10_QUESTIONS[0].replace('[name]', name);

  const handleChipClick = (topic: string) => {
    // Append topic to input (with space if text already exists)
    const newText = value.text.trim()
      ? `${value.text.trim()} ${topic}`
      : topic;

    onChange({ text: newText });
    setHasUserTyped(true);

    // Focus input and place cursor at end
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const length = newText.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 0);
  };

  const handleTextChange = (text: string) => {
    onChange({ text });
    if (text.length > 0) {
      setHasUserTyped(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift) if can continue
    if (e.key === 'Enter' && !e.shiftKey && canContinue) {
      e.preventDefault();
      onContinue();
    }
  };

  // Focus input on container click
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Question */}
        <h2 className="text-2xl font-medium mb-6 text-gray-800 dark:text-gray-200">
          {question}
        </h2>

        {/* Input field container */}
        <div
          onClick={handleContainerClick}
          data-input-value={value.text}
          className="w-full min-h-[120px] px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-text mb-4 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent"
        >
          <textarea
            ref={inputRef}
            value={value.text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start typing..."
            className="w-full h-full min-h-[100px] bg-transparent border-none outline-none resize-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Topic chips */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <AnimatePresence mode="popLayout">
              {TOPIC_OPTIONS.map((topic) => (
                <motion.button
                  key={topic}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleChipClick(topic)}
                  className="px-3 py-2 text-sm rounded-lg border transition-colors border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
                >
                  {topic}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          disabled={!canContinue}
          data-testid="continue-button"
          data-can-continue={canContinue ? 'true' : 'false'}
          data-has-user-typed={hasUserTyped ? 'true' : 'false'}
          className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
