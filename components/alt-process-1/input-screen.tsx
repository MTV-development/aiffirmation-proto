'use client';

import { useState } from 'react';

interface InputScreenProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export function InputScreen({ onSubmit, disabled }: InputScreenProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Just Start Talking
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Don't filter it. Vent, worry, or just list your to-dos. The AI will find what you need.
        </p>
      </div>

      {/* Text Area */}
      <div className="flex-1 min-h-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type to begin..."
          disabled={disabled}
          className="w-full h-full min-h-[200px] p-4 text-base bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          autoFocus
        />
      </div>

      {/* Next Button */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          className="w-full py-4 px-6 text-base font-medium text-white bg-[#5B7FE1] rounded-xl hover:bg-[#4A6ED0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#5B7FE1]"
        >
          {disabled ? 'Processing...' : 'Next'}
        </button>
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Press ⌘+Enter to submit
        </p>
      </div>
    </div>
  );
}
