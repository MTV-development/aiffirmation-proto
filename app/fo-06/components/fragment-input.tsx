'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FragmentInputProps {
  reflectiveStatement?: string;  // Optional for FO-06
  question: string;
  initialFragments: string[];  // 5 fragments
  expandedFragments: string[]; // 8 more fragments
  value: { text: string };
  onChange: (value: { text: string }) => void;
  onContinue: () => void;
  isLoading?: boolean;
}

/**
 * Fragment input component for FO-06 detail-gathering screens.
 *
 * Features:
 * - Reflective statement display (optional, omitted if not provided or empty)
 * - Question display with appropriate spacing
 * - Prominent input field with "Start typing..." placeholder
 * - "Inspiration" link that reveals sentence fragment chips
 * - Multi-line chips with wrapped text (sentence fragments)
 * - Clicking a fragment: removes "...", adds space, focuses input with cursor at end
 * - "More Inspiration" to show additional fragments
 * - Continue button enabled only after user has typed or selected a fragment
 */
export function FragmentInput({
  reflectiveStatement,
  question,
  initialFragments,
  expandedFragments,
  value,
  onChange,
  onContinue,
  isLoading = false,
}: FragmentInputProps) {
  // State tracking
  const [showInspiration, setShowInspiration] = useState(false);
  const [showMoreInspiration, setShowMoreInspiration] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Determine if Continue button should be enabled
  const canContinue = hasUserTyped && value.text.trim().length > 0;

  // Get visible fragments based on state
  const visibleFragments = showMoreInspiration
    ? [...initialFragments, ...expandedFragments]
    : initialFragments;

  // Deduplicate fragments while preserving order
  const seen = new Set<string>();
  const uniqueFragments = visibleFragments.filter((fragment) => {
    if (seen.has(fragment)) return false;
    seen.add(fragment);
    return true;
  });

  const handleInspirationClick = () => {
    setShowInspiration(true);
  };

  const handleMoreInspirationClick = () => {
    setShowMoreInspiration(true);
  };

  const handleFragmentClick = (fragment: string) => {
    // Remove trailing "..." from fragment and add a space for continuation
    const cleanedFragment = fragment.replace(/\.{2,}$/, '').trim() + ' ';

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

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Reflective statement (omitted if not provided or empty) */}
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

        {/* Inspiration link (shown when no inspiration yet) */}
        {!showInspiration && (
          <button
            onClick={handleInspirationClick}
            className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-6 hover:underline"
          >
            Inspiration
          </button>
        )}

        {/* Fragment chips (multi-line with wrapped text) */}
        {showInspiration && (
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
                    className="px-3 py-2 text-sm rounded-lg border whitespace-normal text-left max-w-[200px] transition-colors border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
                  >
                    {fragment}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* More Inspiration link */}
            {!showMoreInspiration && expandedFragments.length > 0 && (
              <button
                onClick={handleMoreInspirationClick}
                className="text-purple-600 dark:text-purple-400 text-sm font-medium mt-4 hover:underline"
              >
                More Inspiration
              </button>
            )}
          </div>
        )}

        {/* Spacer when inspiration is shown but no link below */}
        {showInspiration && (showMoreInspiration || expandedFragments.length === 0) && (
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
