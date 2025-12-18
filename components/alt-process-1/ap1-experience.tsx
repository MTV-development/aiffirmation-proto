'use client';

import { useCallback, useState } from 'react';
import { useLocalStorageState } from './storage';
import { InputScreen } from './input-screen';
import { ProcessingScreen } from './processing-screen';
import { ResultsScreen } from './results-screen';
import { DoneScreen } from './done-screen';
import type { AP1State } from './types';
import { initialAP1State } from './types';
import { generateAP01 } from '@/app/alt-process-1/actions';

export function AP1Experience() {
  const { state, setState, hydrated } = useLocalStorageState<AP1State>(
    'ap01.state.v1',
    initialAP1State
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const reset = useCallback(() => {
    setState(initialAP1State);
  }, [setState]);

  const handleInputSubmit = useCallback(
    async (text: string) => {
      setIsGenerating(true);
      setState((prev) => ({
        ...prev,
        userInput: text,
        error: null,
      }));

      try {
        const result = await generateAP01({
          userInput: text,
        });

        setState((prev) => ({
          ...prev,
          phase: 'processing',
          extractedTags: result.tags,
          generatedAffirmations: result.affirmations,
          shownAffirmations: result.affirmations,
        }));
      } catch (e) {
        setState((prev) => ({
          ...prev,
          error: e instanceof Error ? e.message : 'Failed to generate',
        }));
      } finally {
        setIsGenerating(false);
      }
    },
    [setState]
  );

  const handleProcessingComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'results',
    }));
  }, [setState]);

  const handleToggleSave = useCallback(
    (affirmation: string) => {
      setState((prev) => {
        const isSaved = prev.savedAffirmations.includes(affirmation);
        if (isSaved) {
          // Remove from saved, add to skipped
          return {
            ...prev,
            savedAffirmations: prev.savedAffirmations.filter((a) => a !== affirmation),
            skippedAffirmations: prev.skippedAffirmations.includes(affirmation)
              ? prev.skippedAffirmations
              : [...prev.skippedAffirmations, affirmation],
          };
        } else {
          // Add to saved, remove from skipped
          return {
            ...prev,
            savedAffirmations: [...prev.savedAffirmations, affirmation],
            skippedAffirmations: prev.skippedAffirmations.filter((a) => a !== affirmation),
          };
        }
      });
    },
    [setState]
  );

  const handleShuffle = useCallback(async () => {
    setIsGenerating(true);

    // Get current state values before async operation
    const currentUserInput = state.userInput;
    const currentShown = state.shownAffirmations;
    const currentSaved = state.savedAffirmations;
    const currentGenerated = state.generatedAffirmations;

    // Calculate skipped: all non-saved from current batch
    const currentNotSaved = currentGenerated.filter(
      (a) => !currentSaved.includes(a)
    );
    const currentSkipped = Array.from(
      new Set([...state.skippedAffirmations, ...currentNotSaved])
    );

    try {
      const result = await generateAP01({
        userInput: currentUserInput,
        previousAffirmations: currentShown,
        savedAffirmations: currentSaved,
        skippedAffirmations: currentSkipped,
      });

      setState((prev) => ({
        ...prev,
        generatedAffirmations: result.affirmations,
        skippedAffirmations: currentSkipped,
        shownAffirmations: Array.from(
          new Set([...prev.shownAffirmations, ...result.affirmations])
        ),
        shuffleCount: prev.shuffleCount + 1,
      }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        error: e instanceof Error ? e.message : 'Failed to generate',
      }));
    } finally {
      setIsGenerating(false);
    }
  }, [setState, state]);

  const handleFinish = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'done',
    }));
  }, [setState]);

  const handleCopy = useCallback(async () => {
    const text = state.savedAffirmations.map((a) => `• ${a}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      // Could show a toast here
    } catch {
      // Clipboard not available
    }
  }, [state.savedAffirmations]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header with reset */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            AP-01: The Contextual Mirror
          </h2>
        </div>
        {state.phase !== 'input' && (
          <button
            onClick={reset}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Start Over
          </button>
        )}
      </div>

      {/* Error display */}
      {state.error && (
        <div className="mb-4 p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {state.error}
        </div>
      )}

      {/* Phase-based content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 min-h-[500px]">
        {state.phase === 'input' && (
          <InputScreen onSubmit={handleInputSubmit} disabled={isGenerating} />
        )}

        {state.phase === 'processing' && (
          <ProcessingScreen
            tags={state.extractedTags}
            onComplete={handleProcessingComplete}
          />
        )}

        {state.phase === 'results' && (
          <ResultsScreen
            affirmations={state.generatedAffirmations}
            savedAffirmations={state.savedAffirmations}
            onToggleSave={handleToggleSave}
            onShuffle={handleShuffle}
            onFinish={handleFinish}
            isShuffling={isGenerating}
          />
        )}

        {state.phase === 'done' && (
          <DoneScreen
            savedAffirmations={state.savedAffirmations}
            onStartOver={reset}
            onCopy={handleCopy}
          />
        )}
      </div>

      {/* Stats footer */}
      {state.phase === 'results' && (
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Shuffled {state.shuffleCount} time{state.shuffleCount !== 1 ? 's' : ''} •{' '}
          {state.shownAffirmations.length} total shown •{' '}
          {state.savedAffirmations.length} saved
        </div>
      )}
    </div>
  );
}
