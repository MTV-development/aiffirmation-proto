'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AffirmationCard } from './affirmation-card';

interface AffirmationCardFlowProps {
  affirmations: string[];
  onComplete: (loved: string[], discarded: string[]) => void;
  totalLovedSoFar: number;
  target?: number;
  onRequestMore?: () => void;
}

/**
 * Phase-aware card-by-card review flow for FO-12.
 *
 * Shows affirmations one at a time with Love it / Discard actions.
 * Uses a global progress counter ("X of {target} selected") that reflects
 * totalLovedSoFar plus any loved in the current batch.
 *
 * Progress bar reflects global progress (totalLovedSoFar / target).
 *
 * In phase 3 continuous mode: if we run out of cards before reaching
 * the target and onRequestMore is provided, calls onRequestMore instead
 * of onComplete so the state machine can generate more affirmations.
 *
 * Calls onComplete when all cards in the batch are reviewed (or when
 * the target is reached via loving enough affirmations).
 */
export function AffirmationCardFlow({
  affirmations,
  onComplete,
  totalLovedSoFar,
  target = 30,
  onRequestMore,
}: AffirmationCardFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loved, setLoved] = useState<string[]>([]);
  const [discarded, setDiscarded] = useState<string[]>([]);

  const total = affirmations.length;
  const globalLoved = totalLovedSoFar + loved.length;
  const reachedTarget = globalLoved >= target;

  const advance = useCallback(
    (lovedList: string[], discardedList: string[], justLoved: boolean) => {
      const newGlobalLoved = totalLovedSoFar + lovedList.length;

      // Check if we've reached the target
      if (newGlobalLoved >= target) {
        onComplete(lovedList, discardedList);
        return;
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex >= total) {
        // We've run out of cards
        if (onRequestMore) {
          // Phase 3 continuous mode: request more affirmations
          onRequestMore();
        } else {
          // Normal batch completion
          onComplete(lovedList, discardedList);
        }
      } else {
        setCurrentIndex(nextIndex);
      }
    },
    [currentIndex, total, onComplete, onRequestMore, totalLovedSoFar, target]
  );

  const handleLove = useCallback(() => {
    const updated = [...loved, affirmations[currentIndex]];
    setLoved(updated);
    advance(updated, discarded, true);
  }, [loved, discarded, affirmations, currentIndex, advance]);

  const handleDiscard = useCallback(() => {
    const updated = [...discarded, affirmations[currentIndex]];
    setDiscarded(updated);
    advance(loved, updated, false);
  }, [loved, discarded, affirmations, currentIndex, advance]);

  // Global progress for the bar
  const progressPercent = Math.min((globalLoved / target) * 100, 100);

  return (
    <motion.div
      className="max-w-md mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-testid="affirmation-card-flow"
    >
      {/* Progress bar with global counter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {globalLoved} of {target} selected
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-600 rounded-full"
            initial={{ width: `${(totalLovedSoFar / target) * 100}%` }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

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
