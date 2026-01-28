'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface StepTopicsProps {
  currentStep: number;
  name: string;
  topics: string[];
  onTopicsChange: (topics: string[]) => void;
  onContinue: () => void;
  onSkip: () => void;
}

const TOPIC_OPTIONS = [
  'Motivation',
  'Focus',
  'Inner peace',
  'Energy boost',
  'Better sleep',
  'Body peace',
  'Self-worth',
  'Boundaries',
  'Letting go',
  'Healing',
  'Gratitude',
  'Positivity',
  'Resilience',
  'Anxiety relief',
  'Stress relief',
  'Courage',
  'Hope',
  'Joy',
  'Patience',
  'Mindfulness',
  'Self-care',
  'Forgiveness',
  'Connection',
  'Self-love',
  'Breakup healing',
  'Impulse control',
  'Digital detox',
  'Productivity',
  'Morning boost',
  'Night calm',
  'Confidence',
  'Calm',
  'Self-discipline',
  'Overthinking',
  'Grief',
  'Loneliness',
];

/**
 * Topics multi-select step (Step 4) for FO-07 onboarding
 *
 * Shows toggleable chips for topic selection.
 * On Continue: triggers confetti, shows success message, auto-advances after delay.
 * "Not sure" option skips the step without requiring selections.
 */
export function StepTopics({
  currentStep,
  name,
  topics,
  onTopicsChange,
  onContinue,
  onSkip,
}: StepTopicsProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  if (currentStep !== 4) return null;

  const toggleTopic = (topic: string) => {
    const isSelected = topics.includes(topic);
    if (isSelected) {
      onTopicsChange(topics.filter((t) => t !== topic));
    } else {
      onTopicsChange([...topics, topic]);
    }
  };

  const handleContinue = () => {
    setShowSuccess(true);

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Auto-advance after showing success message
    setTimeout(() => {
      onContinue();
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200">
              Choose what fits you best right now, {name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              It doesn&apos;t have to be perfect.
            </p>
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {TOPIC_OPTIONS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    topics.includes(topic)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleContinue}
                disabled={topics.length === 0}
                className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
              <button
                onClick={onSkip}
                className="w-full px-8 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Not sure
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8"
          >
            <p className="text-2xl font-medium text-gray-800 dark:text-gray-200">
              Great choices!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
