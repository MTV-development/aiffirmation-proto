'use client';

import { useState } from 'react';

interface StepIntentProps {
  currentStep: number;
  name: string;
  intention: string;
  selectedTopics: string[];
  onIntentionChange: (intention: string) => void;
  onTopicsChange: (topics: string[]) => void;
  onContinue: () => void;
  onIDontKnow: () => void;
}

const INSPIRATION_TOPICS = [
  'Confidence',
  'Self-Worth',
  'Relationships',
  'Career',
  'Health & Wellness',
  'Stress & Anxiety',
  'Gratitude',
];

/**
 * Intent steps (3, 3.2) for FO-01 onboarding
 *
 * Step 3 - Open text intention input
 * Step 3.2 - Inspiration topics selection (shown when user clicks "I don't know")
 */
export function StepIntent({
  currentStep,
  name,
  intention,
  selectedTopics,
  onIntentionChange,
  onTopicsChange,
  onContinue,
  onIDontKnow,
}: StepIntentProps) {
  const [customTopic, setCustomTopic] = useState('');

  const toggleTopic = (topic: string) => {
    const isSelected = selectedTopics.includes(topic);
    if (isSelected) {
      onTopicsChange(selectedTopics.filter((t) => t !== topic));
    } else {
      onTopicsChange([...selectedTopics, topic]);
    }
  };

  const addCustomTopic = () => {
    const trimmed = customTopic.trim();
    if (trimmed && !selectedTopics.includes(trimmed)) {
      onTopicsChange([...selectedTopics, trimmed]);
      setCustomTopic('');
    }
  };

  // Step 3 - Open text intention
  if (currentStep === 3) {
    return (
      <div className="max-w-md mx-auto p-8">
        <h2 className="text-2xl font-medium mb-6 text-center text-gray-800 dark:text-gray-200">
          What do you hope affirmations can help you with, {name}?
        </h2>
        <textarea
          value={intention}
          onChange={(e) => onIntentionChange(e.target.value)}
          placeholder="Write anything you want…"
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 mb-6 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
        />
        <div className="flex flex-col gap-3">
          {intention.trim() && (
            <button
              onClick={onContinue}
              className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Continue
            </button>
          )}
          <button
            onClick={onIDontKnow}
            className="w-full px-8 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            I don&apos;t know
          </button>
        </div>
      </div>
    );
  }

  // Step 3.2 - Inspiration topics
  if (currentStep === 3.2) {
    return (
      <div className="max-w-md mx-auto p-8">
        <h2 className="text-2xl font-medium mb-2 text-center text-gray-800 dark:text-gray-200">
          Get inspired by others 💛
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Here are a few common themes people start with. Pick one or two — or write your own.
        </p>
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {INSPIRATION_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`px-4 py-2 rounded-full border transition-colors ${
                selectedTopics.includes(topic)
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomTopic();
              }
            }}
            placeholder="Or write your own…"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {customTopic.trim() && (
            <button
              onClick={addCustomTopic}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add
            </button>
          )}
        </div>
        {selectedTopics.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Selected:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTopics.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-1"
                >
                  {topic}
                  <button
                    onClick={() => toggleTopic(topic)}
                    className="hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-center">
          <button
            onClick={onContinue}
            disabled={selectedTopics.length === 0}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}
