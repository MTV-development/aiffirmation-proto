'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FragmentInputProps {
  question: string;
  initialFragments: string[];  // 8 fragments
  expandedFragments: string[]; // 15 more fragments
  value: { text: string };
  onChange: (value: { text: string }) => void;
  onContinue: () => void;
  isLoading?: boolean;
  mode?: 'sentences' | 'fragments' | 'words';
  helperText?: string;
  optional?: boolean;
}

/**
 * Fragment input component for FO-12 detail-gathering screens.
 *
 * Features:
 * - Question display with appropriate spacing
 * - Prominent input field with "Start typing..." placeholder
 * - Initial fragments (8) displayed immediately on render
 * - Multi-line chips with wrapped text (sentence fragments)
 * - Clicking a fragment:
 *   - mode='fragments' (default): removes trailing "...", adds space, focuses input
 *   - mode='sentences': appends full text as-is + space, focuses input
 *   - mode='words': appends the word as-is + space, focuses input (same as sentences)
 * - "More" button to show additional fragments (15)
 * - Continue button enabled only after user has typed or selected a fragment
 * - Optional helper text below the question
 */
export function FragmentInput({
  question,
  initialFragments,
  expandedFragments,
  value,
  onChange,
  onContinue,
  isLoading = false,
  mode = 'fragments',
  helperText,
  optional = false,
}: FragmentInputProps) {
  // State tracking
  const [showMore, setShowMore] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Determine if Continue button should be enabled
  const canContinue = optional ? true : (hasUserTyped && value.text.trim().length > 0);

  // Get visible fragments based on state - initial fragments always visible
  const visibleFragments = showMore
    ? [...initialFragments, ...expandedFragments]
    : initialFragments;

  // Deduplicate fragments while preserving order
  const seen = new Set<string>();
  const uniqueFragments = visibleFragments.filter((fragment) => {
    if (seen.has(fragment)) return false;
    seen.add(fragment);
    return true;
  });

  const handleMoreClick = () => {
    setShowMore(true);
  };

  const handleFragmentClick = (fragment: string) => {
    // Process fragment based on mode
    // 'sentences' and 'words' both append the full text as-is
    // 'fragments' removes trailing "..." before appending
    const cleanedFragment = mode === 'fragments'
      ? fragment.replace(/\.{2,}$/, '').trim() + ' '
      : fragment + ' ';

    // Append fragment to input (with space if text already exists)
    const newText = value.text.trim()
      ? `${value.text.trim()} ${cleanedFragment}`
      : cleanedFragment;

    onChange({ text: newText });
    setHasUserTyped(true);

    // Focus input and place cursor at end (after a brief delay for React to update)
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
    if (e.key === 'Enter' && !e.shiftKey && canContinue && !isLoading) {
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

  // Chip styling varies by mode
  const chipClassName = mode === 'words'
    ? 'px-3 py-2 text-sm rounded-lg border text-center transition-colors border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer'
    : 'px-3 py-2 text-sm rounded-lg border whitespace-normal text-left max-w-[200px] transition-colors border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer';

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

        {/* Helper text (optional) */}
        {helperText && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 -mt-2">
            {helperText}
          </p>
        )}

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

        {/* Fragment chips - always visible (no Inspiration toggle) */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <AnimatePresence mode="popLayout">
              {uniqueFragments.map((fragment) => (
                <motion.button
                  key={fragment}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleFragmentClick(fragment)}
                  className={chipClassName}
                >
                  {fragment}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* More button */}
          {!showMore && expandedFragments.length > 0 && (
            <button
              onClick={handleMoreClick}
              className="text-purple-600 dark:text-purple-400 text-sm font-medium mt-4 hover:underline"
            >
              More
            </button>
          )}
        </div>

        {/* Spacer when more is shown or no expanded fragments */}
        {(showMore || expandedFragments.length === 0) && (
          <div className="mb-2" />
        )}

        {/* Next/Continue button */}
        <button
          onClick={onContinue}
          disabled={!canContinue || isLoading}
          data-testid="next-button"
          data-can-continue={canContinue ? 'true' : 'false'}
          data-has-user-typed={hasUserTyped ? 'true' : 'false'}
          className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
        >
          {isLoading ? 'Thinking...' : 'Next'}
        </button>
      </motion.div>
    </div>
  );
}
