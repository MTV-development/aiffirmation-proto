'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo, AnimatePresence } from 'framer-motion';
import type { SwipePhaseProps, SwipeDirection } from './types';

const SWIPE_THRESHOLD = 100;

// Inner component that resets when affirmation changes via key
function SwipeCard({
  affirmation,
  isLoading,
  onSwipe,
  exitDirection,
  setExitDirection,
}: {
  affirmation: string;
  isLoading: boolean;
  onSwipe: (direction: SwipeDirection, affirmation: string) => void;
  exitDirection: SwipeDirection | null;
  setExitDirection: (dir: SwipeDirection | null) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const controls = useAnimation();

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (!affirmation || isLoading) return;

      setExitDirection(direction);

      // Animate card out
      controls.start({
        x: direction === 'right' ? 400 : -400,
        rotate: direction === 'right' ? 15 : -15,
        opacity: 0,
        transition: { duration: 0.25 },
      });

      // Trigger callback after animation
      setTimeout(() => {
        onSwipe(direction, affirmation);
      }, 200);
    },
    [affirmation, isLoading, onSwipe, controls, setExitDirection]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
        const direction: SwipeDirection = offset > 0 ? 'right' : 'left';
        handleSwipe(direction);
      }
    },
    [handleSwipe]
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

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag={!exitDirection ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 p-8 flex items-center justify-center shadow-2xl">
        <p className="text-white text-2xl md:text-3xl font-bold text-center leading-relaxed">
          {affirmation}
        </p>
      </div>
    </motion.div>
  );
}

export function SwipePhase({
  affirmation,
  index,
  savedCount,
  isLoading,
  onSwipe,
  onViewSaved,
}: SwipePhaseProps) {
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Reset exit direction when affirmation changes
  const handleSwipe = useCallback((direction: SwipeDirection, aff: string) => {
    if (direction === 'right') {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    }
    onSwipe(direction, aff);
    // Reset for next card
    setTimeout(() => setExitDirection(null), 300);
  }, [onSwipe]);

  if (isLoading && !affirmation) {
    return (
      <div className="flex flex-col h-full bg-gray-900 items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-400">Generating affirmation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          <h2 className="text-lg font-semibold text-white">Your Affirmations</h2>
          <p className="text-sm text-gray-400">#{index}</p>
        </div>
        {onViewSaved && savedCount > 0 && (
          <button
            onClick={onViewSaved}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition-colors"
          >
            <span className="text-green-400">♥</span>
            <span>{savedCount} saved</span>
          </button>
        )}
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full aspect-[3/4] max-w-sm">
          {/* Swipe card - key forces remount on affirmation change */}
          <SwipeCard
            key={affirmation}
            affirmation={affirmation}
            isLoading={isLoading ?? false}
            onSwipe={handleSwipe}
            exitDirection={exitDirection}
            setExitDirection={setExitDirection}
          />

          {/* Save toast */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              >
                Saved!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute top-2 right-2">
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Controls - shown but won't work without exposing handleSwipe from child */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-center text-gray-500 text-sm">
          Swipe right to save, left to skip • Use arrow keys
        </p>
      </div>
    </div>
  );
}
