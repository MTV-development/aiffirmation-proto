'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThinkingScreenProps {
  /** Sequential messages to display (pulse through in order) */
  messages: string[];
  /** Called when all messages have been shown and the minimum duration has elapsed */
  onComplete: () => void;
  /** Minimum time per message in ms (default: 2500) */
  messageInterval?: number;
}

/**
 * Thinking/loading transition screen for FO-14 onboarding.
 *
 * Displays a pulsing heart icon with sequential messages that
 * transition one after another. Used between discovery steps and
 * affirmation batches as personalized loading screens.
 *
 * The spec requires messages to "pulse in sequence" — sentence 1
 * appears first, then is replaced by sentence 2, and so forth.
 */
export function ThinkingScreen({ messages, onComplete, messageInterval = 2500 }: ThinkingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (messages.length === 0) {
      handleComplete();
      return;
    }

    const timer = setTimeout(() => {
      if (currentIndex < messages.length - 1) {
        // Advance to next message
        setCurrentIndex((prev) => prev + 1);
      } else {
        // All messages shown — complete
        handleComplete();
      }
    }, messageInterval);

    return () => clearTimeout(timer);
  }, [currentIndex, messages.length, messageInterval, handleComplete]);

  if (messages.length === 0) return null;

  return (
    <motion.div
      className="max-w-md mx-auto p-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Pulsing heart */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <motion.svg
          viewBox="0 0 24 24"
          className="w-20 h-20 mx-auto text-purple-500"
          fill="currentColor"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </motion.svg>
      </motion.div>

      {/* Sequential messages */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          className="text-xl font-medium text-gray-800 dark:text-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {messages[currentIndex]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
