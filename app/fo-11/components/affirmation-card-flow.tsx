'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AffirmationCard } from './affirmation-card';

interface AffirmationCardFlowProps {
  affirmations: string[];
  onComplete: (loved: string[], discarded: string[]) => void;
}

/**
 * Orchestrates the card-by-card review of a batch of affirmations.
 *
 * Shows a progress bar with "N/total" counter, renders one AffirmationCard at a time,
 * and tracks loved/discarded arrays. Calls onComplete when all cards are reviewed.
 */
export function AffirmationCardFlow({ affirmations, onComplete }: AffirmationCardFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loved, setLoved] = useState<string[]>([]);
  const [discarded, setDiscarded] = useState<string[]>([]);

  const total = affirmations.length;
  const progress = currentIndex / total;

  const advance = useCallback(
    (lovedList: string[], discardedList: string[]) => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= total) {
        onComplete(lovedList, discardedList);
      } else {
        setCurrentIndex(nextIndex);
      }
    },
    [currentIndex, total, onComplete]
  );

  const handleLove = useCallback(() => {
    const updated = [...loved, affirmations[currentIndex]];
    setLoved(updated);
    advance(updated, discarded);
  }, [loved, discarded, affirmations, currentIndex, advance]);

  const handleDiscard = useCallback(() => {
    const updated = [...discarded, affirmations[currentIndex]];
    setDiscarded(updated);
    advance(loved, updated);
  }, [loved, discarded, affirmations, currentIndex, advance]);

  return (
    <motion.div
      className="max-w-md mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-testid="affirmation-card-flow"
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1}/{total}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card display */}
      <AnimatePresence mode="wait">
        <AffirmationCard
          key={currentIndex}
          affirmation={affirmations[currentIndex]}
          onLove={handleLove}
          onDiscard={handleDiscard}
        />
      </AnimatePresence>
    </motion.div>
  );
}
