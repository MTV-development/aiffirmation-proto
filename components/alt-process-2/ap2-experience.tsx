'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalStorageState } from './storage';
import { CardStack } from './card-stack';
import { BottomBar } from './bottom-bar';
import { TuneSheet } from './tune-sheet';
import { SavedScreen } from './saved-screen';
import type { AP2State, SwipeDirection, TonePreference } from './types';
import { initialAP2State } from './types';
import { generateAP02 } from '@/app/alt-process-2/actions';

const BUFFER_THRESHOLD = 3;

export function AP2Experience() {
  const { state, setState, hydrated } = useLocalStorageState<AP2State>(
    'ap02.state.v1',
    initialAP2State
  );
  const [isTuneOpen, setIsTuneOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fetchingRef = useRef(false);

  const reset = useCallback(() => {
    setState(initialAP2State);
  }, [setState]);

  // Fetch more affirmations
  const fetchMore = useCallback(
    async (isInitial = false, toneOverride?: 'gentle' | 'strong' | 'change_topic') => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setIsGenerating(true);

      try {
        const result = await generateAP02({
          isInitial,
          tonePreference: toneOverride,
          savedAffirmations: state.savedAffirmations,
          skippedAffirmations: state.skippedAffirmations,
          shownAffirmations: state.shownAffirmations,
          totalSwipes: state.totalSwipes,
        });

        setState((prev) => ({
          ...prev,
          affirmationQueue: [...prev.affirmationQueue, ...result.affirmations],
          shownAffirmations: [...prev.shownAffirmations, ...result.affirmations],
          error: null,
        }));
      } catch (e) {
        setState((prev) => ({
          ...prev,
          error: e instanceof Error ? e.message : 'Failed to load affirmations',
        }));
      } finally {
        setIsGenerating(false);
        fetchingRef.current = false;
      }
    },
    [setState, state.savedAffirmations, state.skippedAffirmations, state.shownAffirmations, state.totalSwipes]
  );

  // Initial load
  useEffect(() => {
    if (!hydrated) return;
    if (state.affirmationQueue.length === 0 && !fetchingRef.current) {
      fetchMore(true);
    }
  }, [hydrated, state.affirmationQueue.length, fetchMore]);

  // Check buffer and fetch more if needed
  useEffect(() => {
    if (!hydrated) return;
    const remaining = state.affirmationQueue.length - state.currentIndex;
    if (remaining <= BUFFER_THRESHOLD && !fetchingRef.current) {
      fetchMore(false);
    }
  }, [hydrated, state.affirmationQueue.length, state.currentIndex, fetchMore]);

  const handleSwipe = useCallback(
    (direction: SwipeDirection, affirmation: string) => {
      setState((prev) => {
        const newState = {
          ...prev,
          currentIndex: prev.currentIndex + 1,
          totalSwipes: prev.totalSwipes + 1,
        };

        if (direction === 'right') {
          newState.savedAffirmations = [...prev.savedAffirmations, affirmation];
        } else {
          newState.skippedAffirmations = [...prev.skippedAffirmations, affirmation];
        }

        return newState;
      });
    },
    [setState]
  );

  const handleTuneSelect = useCallback(
    (tone: 'gentle' | 'strong' | 'change_topic') => {
      if (tone === 'change_topic') {
        // Reset and fetch fresh variety
        setState((prev) => ({
          ...prev,
          tonePreference: 'neutral',
        }));
        fetchMore(false, 'change_topic');
      } else {
        setState((prev) => ({
          ...prev,
          tonePreference: tone,
        }));
        fetchMore(false, tone);
      }
    },
    [setState, fetchMore]
  );

  const handleRemoveSaved = useCallback(
    (affirmation: string) => {
      setState((prev) => ({
        ...prev,
        savedAffirmations: prev.savedAffirmations.filter((a) => a !== affirmation),
      }));
    },
    [setState]
  );

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Saved screen
  if (state.phase === 'saved') {
    return (
      <SavedScreen
        affirmations={state.savedAffirmations}
        onBack={() => setState((prev) => ({ ...prev, phase: 'stream' }))}
        onRemove={handleRemoveSaved}
      />
    );
  }

  // Main stream view
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4">
        <h1 className="text-lg font-medium text-white">Today&apos;s Stream</h1>
        <button
          onClick={reset}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Error display */}
      {state.error && (
        <div className="flex-shrink-0 mx-4 mb-4 p-3 rounded-xl border border-red-800 bg-red-900/20 text-red-300 text-sm">
          {state.error}
        </div>
      )}

      {/* Card stack area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
        <CardStack
          affirmations={state.affirmationQueue}
          currentIndex={state.currentIndex}
          onSwipe={handleSwipe}
          isLoading={isGenerating}
        />

        {/* Swipe hints */}
        <div className="mt-4 text-center">
          <p className="text-white/50 text-sm">
            Swipe left to pass · Swipe right to claim
          </p>
          <p className="text-white/30 text-xs mt-1">
            Use ← → arrow keys on keyboard
          </p>
        </div>

        {/* Stats */}
        <div className="mt-2 text-center text-xs text-white/40">
          {state.totalSwipes} swipes · {state.savedAffirmations.length} saved
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0">
        <BottomBar
          onTuneClick={() => setIsTuneOpen(true)}
          onSavedClick={() => setState((prev) => ({ ...prev, phase: 'saved' }))}
          savedCount={state.savedAffirmations.length}
        />
      </div>

      {/* Tune sheet */}
      <TuneSheet
        isOpen={isTuneOpen}
        onClose={() => setIsTuneOpen(false)}
        onSelectTone={handleTuneSelect}
      />
    </div>
  );
}
