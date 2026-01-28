'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DynamicInputValue {
  text: string;
  selectedChips: string[];
}

interface DynamicInputProps {
  reflectiveStatement: string;
  question: string;
  initialChips: string[];
  expandedChips: string[];
  value: DynamicInputValue;
  onChange: (value: DynamicInputValue) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

/**
 * Dynamic input component for detail-gathering screens.
 *
 * Features:
 * - Reflective statement display (omitted if empty)
 * - Question display with appropriate spacing
 * - Input field containing both free text AND chip tags inline
 * - Selected chips shown inside input with x for removal
 * - Suggestion chips below input with + prefix
 * - "Show more" button to expand additional chips
 * - Continue/Next button disabled until input present
 */
export function DynamicInput({
  reflectiveStatement,
  question,
  initialChips,
  expandedChips,
  value,
  onChange,
  onContinue,
  isLoading = false,
}: DynamicInputProps) {
  const [showMore, setShowMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasInput = value.text.trim().length > 0 || value.selectedChips.length > 0;

  // Get available chips (not already selected)
  // Use a filter to remove duplicates while preserving order
  const rawChips = showMore
    ? [...initialChips, ...expandedChips]
    : initialChips;
  const seen = new Set<string>();
  const uniqueChips = rawChips.filter((chip) => {
    if (seen.has(chip)) return false;
    seen.add(chip);
    return true;
  });
  const availableChips = uniqueChips.filter(
    (chip) => !value.selectedChips.includes(chip)
  );

  const addChip = (chip: string) => {
    if (!value.selectedChips.includes(chip)) {
      onChange({
        ...value,
        selectedChips: [...value.selectedChips, chip],
      });
    }
  };

  const removeChip = (chip: string) => {
    onChange({
      ...value,
      selectedChips: value.selectedChips.filter((c) => c !== chip),
    });
  };

  const handleTextChange = (text: string) => {
    onChange({ ...value, text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace to remove last chip if text is empty
    if (
      e.key === 'Backspace' &&
      value.text === '' &&
      value.selectedChips.length > 0
    ) {
      removeChip(value.selectedChips[value.selectedChips.length - 1]);
    }
    // Submit on Enter if there's input
    if (e.key === 'Enter' && hasInput && !isLoading) {
      onContinue();
    }
  };

  // Focus input when clicking anywhere in the input container
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Reflective statement (omitted if empty) */}
        {reflectiveStatement && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-gray-600 dark:text-gray-400 mb-4"
          >
            {reflectiveStatement}
          </motion.p>
        )}

        {/* Question */}
        <h2 className="text-2xl font-medium mb-6 text-gray-800 dark:text-gray-200">
          {question}
        </h2>

        {/* Input field with inline chips */}
        <div
          onClick={handleContainerClick}
          className="w-full min-h-[120px] px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-text flex flex-wrap items-start gap-2 mb-4 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent"
        >
          <AnimatePresence mode="popLayout">
            {value.selectedChips.map((chip) => (
              <motion.span
                key={chip}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm"
              >
                {chip}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(chip);
                  }}
                  className="ml-1 text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 font-medium"
                  aria-label={`Remove ${chip}`}
                >
                  x
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
          <input
            ref={inputRef}
            type="text"
            value={value.text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              value.selectedChips.length === 0
                ? 'Type or select below...'
                : ''
            }
            className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Suggestion chips with + prefix */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <AnimatePresence mode="popLayout">
            {availableChips.map((chip) => (
              <motion.button
                key={chip}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => addChip(chip)}
                className="px-3 py-1 text-sm rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                + {chip}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Show more button */}
        {expandedChips.length > 0 && !showMore && (
          <button
            onClick={() => setShowMore(true)}
            className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-6 hover:underline"
          >
            Show more
          </button>
        )}

        {/* Spacer when showMore is true */}
        {showMore && <div className="mb-6" />}

        {/* Continue button */}
        <button
          onClick={onContinue}
          disabled={!hasInput || isLoading}
          className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Thinking...' : 'Next'}
        </button>
      </motion.div>
    </div>
  );
}
