'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextWithChipsValue {
  text: string;
  chips: string[];
}

interface TextWithChipsProps {
  headline: string;
  placeholder: string;
  primaryChips: string[];
  moreChips: string[];
  value: TextWithChipsValue;
  onChange: (value: TextWithChipsValue) => void;
  onNotSure: () => void;
  onContinue: () => void;
}

/**
 * Reusable component for open text + chips input (Steps 5-7).
 *
 * Features:
 * - Textarea for free text input
 * - Toggleable chips that highlight when selected
 * - "More" button to expand additional chips
 * - "Not sure" skips, "Continue" proceeds
 * - Stores both text and selected chips in value
 */
export function TextWithChips({
  headline,
  placeholder,
  primaryChips,
  moreChips,
  value,
  onChange,
  onNotSure,
  onContinue,
}: TextWithChipsProps) {
  const [showMore, setShowMore] = useState(false);

  const toggleChip = (chip: string) => {
    const isSelected = value.chips.includes(chip);
    if (isSelected) {
      onChange({
        ...value,
        chips: value.chips.filter((c) => c !== chip),
      });
    } else {
      onChange({
        ...value,
        chips: [...value.chips, chip],
      });
    }
  };

  const handleTextChange = (text: string) => {
    onChange({ ...value, text });
  };

  const hasInput = value.text.trim().length > 0 || value.chips.length > 0;

  const visibleChips = showMore
    ? [...primaryChips, ...moreChips]
    : primaryChips;

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-medium mb-6 text-gray-800 dark:text-gray-200">
          {headline}
        </h2>

        {/* Textarea */}
        <textarea
          value={value.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
        />

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <AnimatePresence mode="popLayout">
            {visibleChips.map((chip) => (
              <motion.button
                key={chip}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => toggleChip(chip)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  value.chips.includes(chip)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                }`}
              >
                {chip}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* More button */}
        {moreChips.length > 0 && !showMore && (
          <button
            onClick={() => setShowMore(true)}
            className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-6 hover:underline"
          >
            More +
          </button>
        )}

        {/* Spacer when showMore is true */}
        {showMore && <div className="mb-6" />}

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onContinue}
            disabled={!hasInput}
            className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
          <button
            onClick={onNotSure}
            className="w-full px-8 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Not sure
          </button>
        </div>
      </motion.div>
    </div>
  );
}
