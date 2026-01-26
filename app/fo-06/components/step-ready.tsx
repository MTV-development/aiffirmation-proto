'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { generatePreSummary } from '../actions';
import { GatheringContext } from '../types';

interface StepReadyProps {
  name: string;
  gatheringContext: GatheringContext;
  onContinue: () => void;
}

/**
 * Step Ready: Transition screen between discovery and affirmation generation
 *
 * Shows:
 * - A personalized summary of the user's journey
 * - Recognition that we understand why they want affirmations
 * - Statement that we're ready to generate their affirmations
 * - Continue button to proceed to affirmation generation
 */
export function StepReady({ name, gatheringContext, onContinue }: StepReadyProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const result = await generatePreSummary(gatheringContext);
        setSummary(result);
      } catch (error) {
        console.error('Failed to generate summary:', error);
        setSummary('');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, [gatheringContext]);

  const handleContinue = () => {
    onContinue();
  };

  return (
    <motion.div
      className="max-w-md mx-auto p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-2">
          We hear you, {name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Thank you for sharing. We now understand what brought you here.
        </p>
      </motion.div>

      {isLoading ? (
        <motion.div
          className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span>💜</span>
            <div className="h-4 w-24 bg-purple-200 dark:bg-purple-700 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-purple-100 dark:bg-purple-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-purple-100 dark:bg-purple-800 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-purple-100 dark:bg-purple-800 rounded animate-pulse" />
          </div>
        </motion.div>
      ) : summary ? (
        <motion.div
          className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
            <span>💜</span> Your Journey
          </h3>
          <p className="text-gray-700 dark:text-gray-300">{summary}</p>
        </motion.div>
      ) : null}

      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-gray-700 dark:text-gray-300">
          We&apos;re ready to create affirmations crafted just for you.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-xl transition-colors"
        >
          {isLoading ? 'Preparing...' : 'Create My Affirmations'}
        </button>
      </motion.div>
    </motion.div>
  );
}
