'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatPhase } from './chat-phase';
import { SwipePhase } from './swipe-phase';
import { useSessionStorage } from './use-session-storage';
import type { Phase, ChatMessage, SwipeDirection, CSExperienceProps } from './types';
import {
  startChatSurvey,
  resumeChatSurvey,
  swipeAffirmation,
  skipToSwipe,
  getSessionState,
} from '../actions';

export function CSExperience({ initialRunId }: CSExperienceProps) {
  const { session, isLoaded, saveSession, updatePhase, clearSession } = useSessionStorage();

  const [phase, setPhase] = useState<Phase>('loading');
  const [runId, setRunId] = useState<string | null>(initialRunId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | undefined>();
  const [suggestedResponses, setSuggestedResponses] = useState<string[] | undefined>();
  // Workflow conversation history (from server) - passed back on each resume
  const [workflowHistory, setWorkflowHistory] = useState<Array<{ role: string; content: string; timestamp?: string }>>([]);

  // Swipe state
  const [currentAffirmation, setCurrentAffirmation] = useState<string | undefined>();
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  // Swipe state from server - passed back on each swipe
  const [swipeState, setSwipeState] = useState<{
    profile?: unknown;
    approvedAffirmations?: string[];
    skippedAffirmations?: string[];
    currentIndex?: number;
  }>({});

  // Use ref to track initialization
  const hasInitialized = useRef(false);

  const handleStartNewSession = useCallback(async () => {
    console.log('[Client] handleStartNewSession called');
    setIsLoading(true);
    setError(null);

    try {
      const result = await startChatSurvey();
      console.log('[Client] startChatSurvey result:', JSON.stringify(result, null, 2));

      if (result.status === 'failed') {
        setError(result.error || 'Failed to start session');
        setPhase('chat');
        return;
      }

      setRunId(result.runId);
      saveSession(result.runId, 'chat');
      setPhase('chat');

      if (result.suspendedData) {
        console.log('[Client] Setting currentQuestion:', result.suspendedData.assistantMessage);
        setCurrentQuestion(result.suspendedData.assistantMessage);
        setSuggestedResponses(result.suspendedData.suggestedResponses);
        // Store workflow history for next resume call
        if (result.suspendedData.conversationHistory) {
          setWorkflowHistory(result.suspendedData.conversationHistory);
        }
      } else {
        console.log('[Client] No suspendedData from startChatSurvey');
      }
    } catch (err) {
      setError('Failed to start session');
      console.error('[Client] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [saveSession]);

  // Check for existing session on mount
  useEffect(() => {
    if (!isLoaded || hasInitialized.current) return;
    hasInitialized.current = true;

    const initSession = async () => {
      if (session?.runId) {
        // Try to resume existing session
        try {
          const state = await getSessionState(session.runId);
          if (state.exists && state.status === 'suspended') {
            setRunId(session.runId);
            setPhase(state.phase || 'chat');
            setSavedCount(state.savedCount || 0);

            if (state.suspendedData) {
              if (state.phase === 'chat') {
                setCurrentQuestion(state.suspendedData.assistantMessage);
                setSuggestedResponses(state.suspendedData.suggestedResponses);
              } else if (state.phase === 'swipe') {
                setCurrentAffirmation(state.suspendedData.affirmation);
                setAffirmationIndex(state.suspendedData.index || 0);
              }
            }
            return;
          }
        } catch {
          // Session invalid, start fresh
          clearSession();
        }
      }

      // Start new session
      await handleStartNewSession();
    };

    initSession();
  }, [isLoaded, session, clearSession, handleStartNewSession]);

  const handleSendMessage = useCallback(async (message: string) => {
    console.log('[Client] handleSendMessage called', { runId, isLoading, message });
    if (!runId || isLoading) {
      console.log('[Client] Early return - runId:', runId, 'isLoading:', isLoading);
      return;
    }

    // Add the current assistant question (if any) and user message to history
    setMessages(prev => {
      const newMessages = [...prev];
      // Add the previous assistant question to history if it exists
      if (currentQuestion) {
        newMessages.push({ role: 'assistant', content: currentQuestion });
      }
      // Add the user's new message
      newMessages.push({ role: 'user', content: message });
      return newMessages;
    });
    setCurrentQuestion(undefined);
    setSuggestedResponses(undefined);
    setIsLoading(true);

    try {
      console.log('[Client] Calling resumeChatSurvey with runId:', runId, 'historyLength:', workflowHistory.length);
      // Pass the workflow history from the previous response
      const result = await resumeChatSurvey(runId, message, workflowHistory);
      console.log('[Client] resumeChatSurvey result:', JSON.stringify(result, null, 2));

      if (result.status === 'failed') {
        setError(result.error || 'Failed to send message');
        return;
      }

      if (result.suspendedData) {
        console.log('[Client] suspendedData:', result.suspendedData);
        if (result.suspendedData.step === 'generate-stream') {
          // Transition to swipe phase
          setPhase('swipe');
          updatePhase('swipe');
          setCurrentAffirmation(result.suspendedData.affirmation);
          setAffirmationIndex(result.suspendedData.index || 1);
          // Store swipe state for next swipe call
          if (result.suspendedData.swipeState) {
            setSwipeState(result.suspendedData.swipeState);
          }
        } else {
          // Continue chat - only set currentQuestion (NOT messages)
          // The currentQuestion is appended to allMessages in chat-phase.tsx
          console.log('[Client] Setting currentQuestion:', result.suspendedData.assistantMessage);
          setCurrentQuestion(result.suspendedData.assistantMessage);
          setSuggestedResponses(result.suspendedData.suggestedResponses);
          // Update workflow history for next call
          if (result.suspendedData.conversationHistory) {
            setWorkflowHistory(result.suspendedData.conversationHistory);
          }
        }
      } else {
        console.log('[Client] No suspendedData in result');
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('[Client] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [runId, isLoading, updatePhase, currentQuestion, workflowHistory]);

  const handleSkipToSwipe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await skipToSwipe(runId || undefined);

      if (result.status === 'failed') {
        setError(result.error || 'Failed to skip to swipe');
        return;
      }

      setRunId(result.runId);
      saveSession(result.runId, 'swipe');
      setPhase('swipe');

      if (result.suspendedData) {
        setCurrentAffirmation(result.suspendedData.affirmation);
        setAffirmationIndex(result.suspendedData.index || 1);
        // Store swipe state for next swipe call
        if (result.suspendedData.swipeState) {
          setSwipeState(result.suspendedData.swipeState);
        }
      }
    } catch (err) {
      setError('Failed to skip to swipe');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [runId, saveSession]);

  const handleSwipe = useCallback(async (direction: SwipeDirection, affirmation: string) => {
    if (!runId || isLoading) return;

    setIsLoading(true);
    const action = direction === 'right' ? 'approve' : 'skip';

    if (action === 'approve') {
      setSavedCount(prev => prev + 1);
    }

    try {
      console.log('[Client] Calling swipeAffirmation with swipeState:', swipeState);
      // Pass swipeState from previous response
      const result = await swipeAffirmation(runId, action, affirmation, swipeState);
      console.log('[Client] swipeAffirmation result:', JSON.stringify(result, null, 2));

      if (result.status === 'failed') {
        setError(result.error || 'Failed to process swipe');
        return;
      }

      if (result.suspendedData) {
        setCurrentAffirmation(result.suspendedData.affirmation);
        setAffirmationIndex(result.suspendedData.index || affirmationIndex + 1);
        // Update swipe state for next call
        if (result.suspendedData.swipeState) {
          setSwipeState(result.suspendedData.swipeState);
        }
      } else if (result.status === 'completed' || result.status === 'success') {
        // Workflow completed - user has approved enough affirmations
        // Mastra returns 'success' when workflow completes successfully
        console.log('[Client] Workflow completed! Transitioning to saved phase.');
        setPhase('saved');
      }
    } catch (err) {
      setError('Failed to process swipe');
      console.error('[Client] Swipe error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [runId, isLoading, affirmationIndex, swipeState]);

  const handleReset = useCallback(() => {
    clearSession();
    hasInitialized.current = false;
    setPhase('loading');
    setRunId(null);
    setMessages([]);
    setCurrentQuestion(undefined);
    setSuggestedResponses(undefined);
    setCurrentAffirmation(undefined);
    setAffirmationIndex(0);
    setSavedCount(0);
    setError(null);
    handleStartNewSession();
  }, [clearSession, handleStartNewSession]);

  // Loading state
  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-50 bg-red-500/90 text-white px-4 py-3 flex items-center justify-between"
          >
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset button */}
      <button
        onClick={handleReset}
        className="absolute top-4 right-4 z-40 p-2 text-gray-500 hover:text-gray-300 transition-colors"
        title="Start over"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Phase content */}
      <AnimatePresence mode="wait">
        {phase === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ChatPhase
              messages={messages}
              currentQuestion={currentQuestion}
              suggestedResponses={suggestedResponses}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onSkipToSwipe={handleSkipToSwipe}
            />
          </motion.div>
        )}

        {phase === 'swipe' && currentAffirmation && (
          <motion.div
            key="swipe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <SwipePhase
              affirmation={currentAffirmation}
              index={affirmationIndex}
              savedCount={savedCount}
              isLoading={isLoading}
              onSwipe={handleSwipe}
            />
          </motion.div>
        )}

        {phase === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center bg-gray-900 p-8"
          >
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Your Affirmations Are Ready!
              </h2>
              <p className="text-gray-400 mb-6">
                You&apos;ve collected {savedCount} personalized affirmations based on your preferences.
              </p>
              {swipeState.approvedAffirmations && swipeState.approvedAffirmations.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left max-h-64 overflow-y-auto">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Your Affirmations:</h3>
                  <ul className="space-y-2">
                    {swipeState.approvedAffirmations.map((aff, idx) => (
                      <li key={idx} className="text-gray-100 text-sm flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>{aff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-medium transition-colors"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
