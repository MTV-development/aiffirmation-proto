'use client';

import { useEffect, useState } from 'react';

interface ProcessingScreenProps {
  tags: string[];
  onComplete: () => void;
}

export function ProcessingScreen({ tags, onComplete }: ProcessingScreenProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (tags.length === 0) return;

    // Reveal tags one by one with 1 second delay
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        const next = prev + 1;
        if (next >= tags.length) {
          clearInterval(interval);
          // Wait a moment after last tag, then transition
          setTimeout(onComplete, 800);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tags, onComplete]);

  const visibleTags = tags.slice(0, visibleCount);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Finding Your Focus...
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Analyzing raw thoughts.
        </p>
      </div>

      {/* Animated waveform placeholder */}
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
        <div className="flex items-center gap-1 h-8">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 24 + 8}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Tags appearing one by one */}
      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {visibleTags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm animate-fade-in-scale"
            style={{
              animation: 'fadeInScale 0.3s ease-out forwards',
            }}
          >
            • {tag}
          </span>
        ))}
      </div>

      {/* Processing indicator */}
      {visibleCount < tags.length && (
        <div className="mt-8 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Processing...
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
