'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  PanInfo,
  AnimatePresence,
} from 'framer-motion';

export type SwipeDirection = 'up' | 'down';

export interface SwipePhaseProps {
  affirmation: string;
  index: number;
  total: number;
  onSwipe: (direction: SwipeDirection, affirmation: string) => void;
  isLoading?: boolean;
  name: string;
  isFirstAction: boolean;
}

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
  const y = useMotionValue(0);
  const rotate = useTransform(y, [-200, 200], [10, -10]);
  const opacity = useTransform(y, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const controls = useAnimation();
  // Track if a swipe is in progress to prevent double-swipes
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false);

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      // Block if already swiping, loading, or exitDirection is set
      if (!affirmation || isLoading || isSwipeInProgress || exitDirection) return;

      // Immediately mark as swiping to prevent double-triggers
      setIsSwipeInProgress(true);
      setExitDirection(direction);

      // Animate card out (up = negative y, down = positive y)
      controls.start({
        y: direction === 'up' ? -400 : 400,
        rotate: direction === 'up' ? 10 : -10,
        opacity: 0,
        transition: { duration: 0.25 },
      });

      // Trigger callback after animation
      setTimeout(() => {
        onSwipe(direction, affirmation);
      }, 200);
    },
    [affirmation, isLoading, isSwipeInProgress, exitDirection, onSwipe, controls, setExitDirection]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const offset = info.offset.y;
      const velocity = info.velocity.y;

      if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
        // Negative offset = swiped up (discard), Positive = swiped down (keep)
        const direction: SwipeDirection = offset < 0 ? 'up' : 'down';
        handleSwipe(direction);
      }
    },
    [handleSwipe]
  );

  // Keyboard controls: down=keep, up=discard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleSwipe('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleSwipe('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe]);

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ y, rotate, opacity }}
      drag={!exitDirection ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 0 }}
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
  total,
  isLoading,
  onSwipe,
  name,
  isFirstAction,
}: SwipePhaseProps) {
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Reset exit direction and show toast when affirmation changes
  const handleSwipe = useCallback(
    (direction: SwipeDirection, aff: string) => {
      if (direction === 'down') {
        setToast({ message: 'Successfully saved', type: 'success' });
      } else {
        setToast({ message: 'Discarded', type: 'info' });
      }
      setTimeout(() => setToast(null), 1500);

      // Show feedback message after first action
      if (isFirstAction) {
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 3000);
      }

      onSwipe(direction, aff);
      // Reset for next card
      setTimeout(() => setExitDirection(null), 300);
    },
    [onSwipe, isFirstAction]
  );

  if (isLoading && !affirmation) {
    return (
      <div className="flex flex-col h-full bg-gray-900 items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-400">Loading affirmation...</p>
      </div>
    );
  }

  // First card intro message
  const introMessage =
    index === 1
      ? 'Save this affirmation if it feels right - or discard it if it does not. You are forming your personal list now.'
      : null;

  // Feedback message after first action
  const feedbackMessage = `Keep going ${name} - every time you like or dislike an affirmation we prepare even better affirmations for you.`;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header with counter */}
      <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Affirmation {index} of {total}
        </h2>
      </div>

      {/* Intro message for first card */}
      {introMessage && (
        <div className="px-6 py-3 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{introMessage}</p>
        </div>
      )}

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full aspect-[3/4] max-w-sm">
          {/* Direction indicators */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-gray-400 dark:text-gray-500 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span>Discard</span>
          </div>

          {/* Swipe card - key forces remount on affirmation change */}
          <SwipeCard
            key={affirmation}
            affirmation={affirmation}
            isLoading={isLoading ?? false}
            onSwipe={handleSwipe}
            exitDirection={exitDirection}
            setExitDirection={setExitDirection}
          />

          {/* Save/Discard toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
                  toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}
              >
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Keep indicator at bottom */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-400 dark:text-gray-500 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>Keep</span>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute top-2 right-2">
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Feedback message after first action */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 py-3 text-center"
          >
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              {feedbackMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls hint */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-center text-gray-500 text-sm">
          Swipe for next • Use arrow keys (↓ keep, ↑ discard)
        </p>
      </div>
    </div>
  );
}
