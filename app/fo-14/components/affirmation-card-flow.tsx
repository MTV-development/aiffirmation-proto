'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AffirmationCard } from './affirmation-card';

interface AffirmationCardFlowProps {
  affirmations: string[];
  onComplete: (loved: string[], discarded: string[]) => void;
  globalShownOffset: number;
  shownTarget: number;
}

/**
 * Card-by-card review flow for FO-14.
 *
 * Shows affirmations one at a time with Love it / Discard actions.
 * Counter displays "X of {shownTarget}" where X counts affirmations shown
 * (globalShownOffset + currentIndex + 1), not affirmations loved.
 *
 * Headline "Does this affirmation resonate with you?" shown above each card.
 *
 * Calls onComplete when all cards in the batch are reviewed.
 */
export function AffirmationCardFlow({
  affirmations,
  onComplete,
  globalShownOffset,
  shownTarget,
}: AffirmationCardFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loved, setLoved] = useState<string[]>([]);
  const [discarded, setDiscarded] = useState<string[]>([]);

  const total = affirmations.length;
  const globalShown = globalShownOffset + currentIndex + 1;

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
      {/* Counter: X of 20 */}
      <div className="mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400" data-testid="card-counter">
          {globalShown} of {shownTarget}
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4" data-testid="card-headline">
        Does this affirmation resonate with you?
      </h2>

      {/* Card display */}
      <AnimatePresence mode="wait">
        {currentIndex < total && (
          <AffirmationCard
            key={currentIndex}
            affirmation={affirmations[currentIndex]}
            onLove={handleLove}
            onDiscard={handleDiscard}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
