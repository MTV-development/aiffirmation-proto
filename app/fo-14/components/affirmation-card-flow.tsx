'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AffirmationCard } from './affirmation-card';
import { PHASE1_TARGET } from '../types';

interface AffirmationCardFlowProps {
  affirmations: string[];
  onComplete: (loved: string[], discarded: string[]) => void;
  totalLovedSoFar: number;
  target?: number;
}

/**
 * Card-by-card review flow for FO-14.
 *
 * Shows affirmations one at a time with Love it / Discard actions.
 * Uses a global progress counter ("X of {target} selected") that reflects
 * totalLovedSoFar plus any loved in the current batch.
 *
 * Default target is PHASE1_TARGET (20). For phase 2, pass target=40.
 *
 * Calls onComplete when all cards in the batch are reviewed.
 */
export function AffirmationCardFlow({
  affirmations,
  onComplete,
  totalLovedSoFar,
  target = PHASE1_TARGET,
}: AffirmationCardFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loved, setLoved] = useState<string[]>([]);
  const [discarded, setDiscarded] = useState<string[]>([]);

  const total = affirmations.length;
  const globalLoved = totalLovedSoFar + loved.length;

  const advance = useCallback(
    (lovedList: string[], discardedList: string[]) => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= total) {
        // Batch complete
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
