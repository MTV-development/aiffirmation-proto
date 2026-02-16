'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface HeartAnimationProps {
  message: string;
  onComplete: () => void;
}

/**
 * Heart animation transition component for FO-12 onboarding
 *
 * Displays a pulsing heart icon with a message.
 * Auto-advances after 2.5 seconds or on click.
 *
 * Used between discovery steps as transition screens.
 */
export function HeartAnimation({ message, onComplete }: HeartAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="max-w-md mx-auto p-8 text-center cursor-pointer"
      onClick={onComplete}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
      <motion.p
        className="text-xl font-medium text-gray-800 dark:text-gray-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
