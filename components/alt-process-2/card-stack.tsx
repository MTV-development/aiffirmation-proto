'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { SwipeCard } from './swipe-card';
import type { SwipeDirection } from './types';

interface CardStackProps {
  affirmations: string[];
  currentIndex: number;
  onSwipe: (direction: SwipeDirection, affirmation: string) => void;
  isLoading?: boolean;
}

export function CardStack({
  affirmations,
  currentIndex,
  onSwipe,
  isLoading = false,
}: CardStackProps) {
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);
  const [showToast, setShowToast] = useState(false);

  const currentAffirmation = affirmations[currentIndex];
  const nextAffirmation = affirmations[currentIndex + 1];

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (!currentAffirmation) return;

      setExitDirection(direction);

      if (direction === 'right') {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1500);
      }

      // Small delay to allow exit animation
      setTimeout(() => {
        onSwipe(direction, currentAffirmation);
        setExitDirection(null);
      }, 200);
    },
    [currentAffirmation, onSwipe]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe]);

  if (isLoading && affirmations.length === 0) {
    return (
      <div className="relative w-full aspect-[3/4] max-w-sm mx-auto flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentAffirmation && !isLoading) {
    return (
      <div className="relative w-full aspect-[3/4] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center text-white/70">
          <p className="text-lg">Loading more affirmations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[3/4] max-w-sm mx-auto">
      {/* Card stack */}
      {/* Next card (behind) */}
      {nextAffirmation && !exitDirection && (
        <SwipeCard
          key={`next-${currentIndex + 1}`}
          text={nextAffirmation}
          onSwipe={() => {}}
          isTop={false}
        />
      )}

      {/* Current card (top) */}
      {currentAffirmation && (
        <SwipeCard
          key={`current-${currentIndex}`}
          text={currentAffirmation}
          onSwipe={handleSwipe}
          isTop={true}
          exitDirection={exitDirection}
        />
      )}

      {/* Save toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
          >
            Saved Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator when fetching more */}
      {isLoading && affirmations.length > 0 && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
