'use client';

import { useState } from 'react';
import { DiscoveryWizard } from '@/components/full-process/discovery-wizard';
import { AffirmationReview } from '@/components/full-process/affirmation-review';
import { CollectionSummary } from '@/components/full-process/collection-summary';
import { MidJourneyCheckIn } from '@/components/full-process/mid-journey-checkin';
import { AdjustmentPanel } from '@/components/full-process/adjustment-panel';
import { generateFullProcessAffirmations } from '@/lib/agents/full-process';
import type { UserPreferences, OnboardingPhase, AdjustedPreferences } from '@/src/full-process';

export default function FullProcessPage() {
  const [phase, setPhase] = useState<OnboardingPhase>('discovery');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [adjustedPreferences, setAdjustedPreferences] = useState<AdjustedPreferences | null>(null);
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [likedAffirmations, setLikedAffirmations] = useState<string[]>([]);
  const [shownAffirmations, setShownAffirmations] = useState<string[]>([]);
  const [batchKey, setBatchKey] = useState(0); // Used to force AffirmationReview to reset currentIndex
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDiscoveryComplete = async (prefs: UserPreferences) => {
    setPreferences(prefs);
    setLoading(true);
    setError(null);

    try {
      const result = await generateFullProcessAffirmations({
        preferences: prefs,
        adjustedPreferences: adjustedPreferences ?? undefined,
      });

      setAffirmations(result.affirmations);
      // Don't add to shownAffirmations here - let AffirmationReview track what's actually viewed
      setBatchKey((k) => k + 1);
      setPhase('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate affirmations');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (affirmation: string) => {
    setLikedAffirmations((prev) => [...prev, affirmation]);
  };

  const handleShown = (affirmation: string) => {
    setShownAffirmations((prev) => {
      if (prev.includes(affirmation)) return prev;
      return [...prev, affirmation];
    });
  };

  const handleFinish = () => {
    setPhase('summary');
  };

  const handleCheckIn = () => {
    setPhase('checkin');
  };

  const handleNewBatch = (newAffirmations: string[]) => {
    setAffirmations(newAffirmations);
    // Don't add to shownAffirmations here - let AffirmationReview track what's actually viewed
    setBatchKey((k) => k + 1);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleStartOver = () => {
    setPhase('discovery');
    setPreferences(null);
    setAdjustedPreferences(null);
    setAffirmations([]);
    setLikedAffirmations([]);
    setShownAffirmations([]);
    setBatchKey(0);
    setError(null);
  };

  // Discovery Phase
  if (phase === 'discovery') {
    return (
      <div className="p-6">
        <DiscoveryWizard onComplete={handleDiscoveryComplete} isLoading={loading} />
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 max-w-2xl mx-auto">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Review Phase
  if (phase === 'review' && preferences) {
    return (
      <div className="p-6">
        <AffirmationReview
          key={batchKey}
          affirmations={affirmations}
          preferences={preferences}
          adjustedPreferences={adjustedPreferences}
          likedAffirmations={likedAffirmations}
          shownAffirmations={shownAffirmations}
          onLike={handleLike}
          onShown={handleShown}
          onFinish={handleFinish}
          onCheckIn={handleCheckIn}
          onNewBatch={handleNewBatch}
          onError={handleError}
        />
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 max-w-2xl mx-auto">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    );
  }

  // Check-In Phase
  if (phase === 'checkin' && preferences) {
    const handleContinue = async () => {
      // Generate a fresh batch when continuing
      setLoading(true);
      setError(null);

      try {
        const result = await generateFullProcessAffirmations({
          preferences,
          adjustedPreferences: adjustedPreferences ?? undefined,
          previousAffirmations: shownAffirmations,
        });

        setAffirmations(result.affirmations);
        // Don't add to shownAffirmations here - let AffirmationReview track what's actually viewed
        setBatchKey((k) => k + 1);
        setPhase('review');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate affirmations');
        setPhase('review'); // Go back to review even on error
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="p-6 max-w-xl mx-auto">
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Generating more affirmations...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <MidJourneyCheckIn
          likedCount={likedAffirmations.length}
          likedAffirmations={likedAffirmations}
          onContinue={handleContinue}
          onFinish={handleFinish}
          onAdjust={() => setPhase('adjustment')}
        />
      </div>
    );
  }

  // Adjustment Phase
  if (phase === 'adjustment' && preferences) {
    const handleApplyAdjustments = async (adjustments: AdjustedPreferences) => {
      setAdjustedPreferences(adjustments);
      setLoading(true);
      setError(null);

      try {
        const result = await generateFullProcessAffirmations({
          preferences,
          adjustedPreferences: adjustments,
          previousAffirmations: shownAffirmations,
        });

        setAffirmations(result.affirmations);
        // Don't add to shownAffirmations here - let AffirmationReview track what's actually viewed
        setBatchKey((k) => k + 1);
        setPhase('review');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate affirmations');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="p-6">
        <AdjustmentPanel
          currentChallenges={preferences.challenges}
          currentTone={preferences.tone}
          onApply={handleApplyAdjustments}
          onBack={() => setPhase('checkin')}
          isLoading={loading}
        />
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 max-w-2xl mx-auto">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    );
  }

  // Summary Phase
  if (phase === 'summary') {
    return (
      <div className="p-6">
        <CollectionSummary
          affirmations={likedAffirmations}
          onStartOver={handleStartOver}
        />
      </div>
    );
  }

  return null;
}
