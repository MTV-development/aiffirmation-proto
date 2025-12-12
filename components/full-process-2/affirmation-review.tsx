'use client';

import { useState, useEffect } from 'react';
import { AffirmationCard } from './affirmation-card';
import { generateFullProcess2Affirmations } from '@/app/full-process-2/actions';
import { shouldShowCheckIn } from '@/src/full-process';
import type { UserPreferences, AdjustedPreferences } from '@/src/full-process';

interface AffirmationReviewProps {
  /** Current batch of affirmations */
  affirmations: string[];
  /** Initial index to start from */
  initialIndex?: number;
  /** User preferences for generating more affirmations */
  preferences: UserPreferences;
  /** Adjusted preferences from check-in */
  adjustedPreferences?: AdjustedPreferences | null;
  /** Currently liked affirmations */
  likedAffirmations: string[];
  /** All previously shown affirmations (to avoid repeats) */
  shownAffirmations: string[];
  /** Callback when an affirmation is liked */
  onLike: (affirmation: string) => void;
  /** Callback when an affirmation is shown/viewed */
  onShown: (affirmation: string) => void;
  /** Callback when moving to summary */
  onFinish: () => void;
  /** Callback when check-in should be shown */
  onCheckIn?: () => void;
  /** Callback when new batch is generated */
  onNewBatch: (affirmations: string[]) => void;
  /** Callback when error occurs */
  onError: (error: string) => void;
}

/**
 * Derive skipped affirmations from shown minus liked
 */
function getSkippedAffirmations(shown: string[], liked: string[]): string[] {
  return shown.filter(a => !liked.includes(a));
}

/**
 * Affirmation review loop component
 * Handles like/skip, batch regeneration, and finish early
 *
 * FP-02: This version passes feedback data (liked/skipped) to the agent
 * for learning and better-aligned affirmation generation.
 */
export function AffirmationReview({
  affirmations,
  initialIndex = 0,
  preferences,
  adjustedPreferences,
  likedAffirmations,
  shownAffirmations,
  onLike,
  onShown,
  onFinish,
  onCheckIn,
  onNewBatch,
  onError,
}: AffirmationReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const currentAffirmation = affirmations[currentIndex];
  const likedCount = likedAffirmations.length;

  // Track when an affirmation is actually shown to the user
  useEffect(() => {
    if (currentAffirmation) {
      onShown(currentAffirmation);
    }
  }, [currentAffirmation, onShown]);

  const generateMoreAffirmations = async () => {
    setLoading(true);
    try {
      // FP-02: Pass feedback data for learning
      const result = await generateFullProcess2Affirmations({
        preferences,
        adjustedPreferences: adjustedPreferences ?? undefined,
        previousAffirmations: shownAffirmations,
        approvedAffirmations: likedAffirmations,
        skippedAffirmations: getSkippedAffirmations(shownAffirmations, likedAffirmations),
      });
      onNewBatch(result.affirmations);
      setCurrentIndex(0);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to generate more affirmations');
    } finally {
      setLoading(false);
    }
  };

  const moveToNext = async () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= affirmations.length) {
      // Batch exhausted
      if (likedCount === 0) {
        // No likes yet, generate more automatically
        await generateMoreAffirmations();
      } else if (likedCount < 5) {
        // Have some likes but less than 5, generate more
        await generateMoreAffirmations();
      } else {
        // Have enough likes, go to summary
        onFinish();
      }
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleLike = async () => {
    if (transitioning) return;

    setTransitioning(true);
    onLike(currentAffirmation);

    const newLikedCount = likedCount + 1;

    // Check if we should show check-in
    if (onCheckIn && shouldShowCheckIn(newLikedCount)) {
      setTransitioning(false);
      onCheckIn();
      return;
    }

    // Small delay for animation feel
    setTimeout(async () => {
      await moveToNext();
      setTransitioning(false);
    }, 150);
  };

  const handleSkip = async () => {
    if (transitioning) return;

    setTransitioning(true);
    // Small delay for animation feel
    setTimeout(async () => {
      await moveToNext();
      setTransitioning(false);
    }, 150);
  };

  const handleFinishEarly = () => {
    if (likedCount > 0) {
      onFinish();
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Generating more affirmations...</p>
        </div>
      </div>
    );
  }

  if (!currentAffirmation) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No affirmations available.</p>
        <button
          onClick={generateMoreAffirmations}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Affirmations
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <AffirmationCard
        affirmation={currentAffirmation}
        current={currentIndex + 1}
        total={affirmations.length}
        likedCount={likedCount}
        onLike={handleLike}
        onSkip={handleSkip}
        disabled={transitioning}
      />

      {/* Finish Early option */}
      {likedCount > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={handleFinishEarly}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline"
          >
            Finish Early ({likedCount} saved)
          </button>
        </div>
      )}
    </div>
  );
}
