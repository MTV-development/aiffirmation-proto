'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatComposer, ChatTranscript } from './chat-ui';
import { useLocalStorageState } from './storage';
import { CHALLENGE_PRESETS, DEFAULT_TONES, FOCUS_PRESETS, getInspirationExamples, type FocusPreset } from './inspiration';
import type { ChatMessage, FP3State, QuickReply } from './types';
import { initialFP3State } from './types';
import { generateFullProcess3Affirmations } from '@/app/full-process-3/actions';

const TYPING_DELAY = 600; // ms to show typing indicator before each bubble

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function assistantMessage(text: string, quickReplies?: QuickReply[]): ChatMessage {
  return { id: id('a'), role: 'assistant', text, quickReplies };
}

function userMessage(text: string): ChatMessage {
  return { id: id('u'), role: 'user', text };
}

function clamp<T>(arr: T[], max: number) {
  if (arr.length <= max) return arr;
  return arr.slice(arr.length - max);
}

export function FullProcess3ChatExperience() {
  const { state, setState, hydrated } = useLocalStorageState<FP3State>('fp03.chat.v2', initialFP3State);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isBusy = state.phase === 'generating' || isTyping;

  const focusQuickReplies = useMemo<QuickReply[]>(
    () => [
      ...FOCUS_PRESETS.map((label) => ({ id: `focus_${label}`, label, value: label })),
      { id: 'focus_custom', label: 'Something else…', value: '__custom__' },
    ],
    []
  );

  const toneQuickReplies = useMemo<QuickReply[]>(
    () => [
      ...DEFAULT_TONES.map((label) => ({ id: `tone_${label}`, label, value: label })),
      { id: 'tone_custom', label: 'Custom…', value: '__custom__' },
    ],
    []
  );

  const frictionQuickReplies = useMemo<QuickReply[]>(
    () => [
      ...CHALLENGE_PRESETS.map((label) => ({ id: `fr_${label}`, label, value: label })),
      { id: 'fr_skip', label: 'Skip', value: '__skip__' },
      { id: 'fr_custom', label: 'Add my own…', value: '__custom__' },
    ],
    []
  );

  // Initial boot message with animation
  useEffect(() => {
    if (!hydrated) return;
    if (state.messages.length > 0) return;

    const showIntro = async () => {
      setState((prev) => ({ ...prev, phase: 'intro' }));
      await pushAssistantWithTyping(
        `Let's build affirmations that feel personal and easy to believe.\n\nWhat do you want them for?`,
        focusQuickReplies
      );
    };

    showIntro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages.length, state.phase, isTyping]);

  // Push messages immediately (no animation) - used for user messages and internal state
  const pushImmediate = useCallback((messages: ChatMessage[]) => {
    setState((prev) => ({ ...prev, messages: [...prev.messages, ...messages], error: null }));
  }, [setState]);

  // Push assistant messages with typing indicator animation
  // Splits text on \n\n into separate bubbles with delays
  const pushAssistantWithTyping = useCallback(async (text: string, quickReplies?: QuickReply[]) => {
    const paragraphs = text.split('\n\n').filter(Boolean);

    for (let i = 0; i < paragraphs.length; i++) {
      const isLast = i === paragraphs.length - 1;
      const paragraph = paragraphs[i];

      // Show typing indicator
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, TYPING_DELAY));
      setIsTyping(false);

      // Add the message (only last paragraph gets quick replies)
      const msg = assistantMessage(paragraph, isLast ? quickReplies : undefined);
      setState((prev) => ({ ...prev, messages: [...prev.messages, msg], error: null }));
    }
  }, [setState]);

  // Legacy push for backward compat - routes to appropriate handler
  const push = useCallback((messages: ChatMessage[]) => {
    // For user messages, push immediately
    // For assistant messages, this is immediate (use pushAssistantWithTyping for animated)
    setState((prev) => ({ ...prev, messages: [...prev.messages, ...messages], error: null }));
  }, [setState]);

  const setPhase = (phase: FP3State['phase']) => setState((prev) => ({ ...prev, phase }));

  const reset = () => setState(initialFP3State);

  const goToFriction = async () => {
    setPhase('friction');
    await pushAssistantWithTyping(
      `Anything that tends to get in the way? (Optional)\n\nPick one, or skip.`,
      frictionQuickReplies
    );
  };

  const goToTone = async () => {
    setPhase('tone');
    await pushAssistantWithTyping(`What kind of voice should these have?`, toneQuickReplies);
  };

  const goToInspiration = async () => {
    const preset = (FOCUS_PRESETS as readonly string[]).includes(state.draft.focus ?? '')
      ? (state.draft.focus as FocusPreset)
      : 'Confidence';

    const examples = getInspirationExamples(preset);
    const quickReplies: QuickReply[] = examples.map((x, idx) => ({
      id: `ex_${idx}`,
      label: `Like: "${x}"`,
      value: x,
    }));

    quickReplies.push({ id: 'ex_done', label: 'Done', value: '__done__' });

    setPhase('inspiration');
    await pushAssistantWithTyping(
      `Here are a few example lines (just for inspiration). Tap any you like — we'll match that style.\n\n${examples
        .map((x) => `• ${x}`)
        .join('\n')}`,
      quickReplies
    );
  };

  const goToConfirm = async () => {
    const summary = [
      `Focus: ${state.draft.focus || '(not set)'}`,
      `Friction: ${state.draft.challenges.length ? state.draft.challenges.join(', ') : '(none)'}`,
      `Tone: ${state.draft.tone || '(not set)'}`,
      `Style picks: ${state.draft.likedExamples.length ? `${state.draft.likedExamples.length} liked` : '(none)'}`,
    ].join('\n');

    setPhase('confirm');
    await pushAssistantWithTyping(
      `Great — here's what I'll use:\n\n${summary}\n\nAnything you want me to avoid? (Optional: "no spiritual language", "no hype", etc.)`,
      [
        { id: 'avoid_none', label: 'Nope', value: '__none__' },
        { id: 'avoid_custom', label: "I'll type it…", value: '__custom__' },
        { id: 'avoid_generate', label: 'Generate now', value: '__generate__' },
        { id: 'edit_focus', label: 'Edit focus', value: '__edit_focus__' },
        { id: 'edit_friction', label: 'Edit friction', value: '__edit_friction__' },
        { id: 'edit_tone', label: 'Edit tone', value: '__edit_tone__' },
      ]
    );
  };

  const startGeneration = async (extraAvoidNotes?: string) => {
    if (!state.draft.focus || !state.draft.tone) return;
    setState((prev) => ({ ...prev, phase: 'generating', error: null }));
    setIsTyping(true); // Show typing indicator while generating

    try {
      const avoidFromNotes = (extraAvoidNotes ?? '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

      const result = await generateFullProcess3Affirmations({
        preferences: {
          focus: state.draft.focus,
          challenges: state.draft.challenges,
          tone: state.draft.tone,
        },
        styleHints: {
          likedExamples: clamp(state.draft.likedExamples, 6),
          notes: state.draft.notes || undefined,
          avoid: clamp([...state.draft.avoid, ...avoidFromNotes], 12),
        },
        previousAffirmations: clamp(state.shownAffirmations, 40),
        approvedAffirmations: clamp(state.savedAffirmations, 20),
        skippedAffirmations: clamp(state.skippedAffirmations, 20),
      });

      setIsTyping(false);

      setState((prev) => ({
        ...prev,
        phase: 'review',
        generatedAffirmations: result.affirmations,
        currentIndex: 0,
        batchCount: prev.batchCount + 1,
        shownAffirmations: Array.from(new Set([...prev.shownAffirmations, ...result.affirmations])),
      }));

      await pushAssistantWithTyping(
        `Done — here are ${result.affirmations.length}.\n\nJust two choices: "I like it" or "Not so much".`
      );
    } catch (e) {
      setIsTyping(false);
      setState((prev) => ({
        ...prev,
        phase: 'confirm',
        error: e instanceof Error ? e.message : 'Failed to generate affirmations',
      }));
    }
  };

  const handleQuickReply = async (reply: QuickReply) => {
    if (isBusy) return;

    // INTRO/FOCUS
    if (state.phase === 'intro' || state.phase === 'focus') {
      if (reply.value === '__custom__') {
        setPhase('focus');
        await pushAssistantWithTyping(`Type your focus in a few words. (Example: "speaking up at work")`);
        return;
      }

      setState((prev) => ({ ...prev, draft: { ...prev.draft, focus: reply.value } }));
      pushImmediate([userMessage(reply.value)]);
      await goToFriction();
      return;
    }

    // FRICTION
    if (state.phase === 'friction') {
      if (reply.value === '__skip__') {
        pushImmediate([userMessage('Skip')]);
        setState((prev) => ({ ...prev, draft: { ...prev.draft, challenges: [] } }));
        await goToTone();
        return;
      }
      if (reply.value === '__custom__') {
        await pushAssistantWithTyping(`Tell me what gets in the way (comma-separated is fine).`);
        return;
      }

      // Onboarding-friendly: take a single pick and continue immediately.
      setState((prev) => ({ ...prev, draft: { ...prev.draft, challenges: [reply.value] } }));
      pushImmediate([userMessage(`Friction: ${reply.label}`)]);
      await goToTone();
      return;
    }

    // TONE
    if (state.phase === 'tone') {
      if (reply.value === '__custom__') {
        await pushAssistantWithTyping(`Type the voice you want. (Example: "soft but confident", "grounded and practical")`);
        return;
      }
      setState((prev) => ({ ...prev, draft: { ...prev.draft, tone: reply.value } }));
      pushImmediate([userMessage(reply.value)]);
      await goToInspiration();
      return;
    }

    // INSPIRATION
    if (state.phase === 'inspiration') {
      if (reply.value === '__done__') {
        pushImmediate([userMessage('Done')]);
        await goToConfirm();
        return;
      }

      setState((prev) => ({
        ...prev,
        draft: { ...prev.draft, likedExamples: clamp([...prev.draft.likedExamples, reply.value], 12) },
      }));
      pushImmediate([userMessage(`Liked: "${reply.value}"`)]);
      return;
    }

    // CONFIRM
    if (state.phase === 'confirm') {
      if (reply.value === '__none__') {
        pushImmediate([userMessage('No avoids')]);
        await startGeneration();
        return;
      }
      if (reply.value === '__custom__') {
        await pushAssistantWithTyping(`Type what to avoid, then press Send.`);
        return;
      }
      if (reply.value === '__generate__') {
        pushImmediate([userMessage('Generate now')]);
        await startGeneration();
        return;
      }
      if (reply.value === '__edit_focus__') {
        pushImmediate([userMessage('Edit focus')]);
        setPhase('focus');
        await pushAssistantWithTyping(`Sure — what do you want these affirmations for?`, focusQuickReplies);
        return;
      }
      if (reply.value === '__edit_friction__') {
        pushImmediate([userMessage('Edit friction')]);
        await goToFriction();
        return;
      }
      if (reply.value === '__edit_tone__') {
        pushImmediate([userMessage('Edit tone')]);
        await goToTone();
        return;
      }
    }

    // CHECK-IN LOOP
    if (state.phase === 'checkin') {
      if (reply.value === '__more__') {
        pushImmediate([userMessage('Yes — give me more')]);
        await startGeneration();
        return;
      }
      if (reply.value === '__adjust__') {
        pushImmediate([userMessage('Adjust')]);
        await goToAdjust();
        return;
      }
      if (reply.value === '__finish__') {
        pushImmediate([userMessage('Finish')]);
        setState((prev) => ({ ...prev, phase: 'done' }));
        await pushAssistantWithTyping(`All set. You saved ${state.savedAffirmations.length} affirmations.`);
        return;
      }
    }

    // ADJUST
    if (state.phase === 'adjust') {
      if (reply.value === '__adj_back__') {
        pushImmediate([userMessage('Back')]);
        setState((prev) => ({ ...prev, phase: 'checkin' }));
        return;
      }
      if (reply.value === '__adj_tone__') {
        pushImmediate([userMessage('Tone')]);
        setPhase('tone');
        await pushAssistantWithTyping(`What kind of voice should these have?`, toneQuickReplies);
        return;
      }
      if (reply.value === '__adj_friction__') {
        pushImmediate([userMessage('Friction')]);
        await goToFriction();
        return;
      }
      if (reply.value === '__adj_focus__') {
        pushImmediate([userMessage('Focus')]);
        setPhase('focus');
        await pushAssistantWithTyping(`What do you want them for?`, focusQuickReplies);
        return;
      }
    }
  };

  const send = async () => {
    if (isBusy) return;
    const text = input.trim();
    if (!text) return;
    setInput('');

    // If we're in focus custom entry
    if (state.phase === 'focus') {
      setState((prev) => ({ ...prev, draft: { ...prev.draft, focus: text } }));
      pushImmediate([userMessage(text)]);
      await goToFriction();
      return;
    }

    // Friction custom entry
    if (state.phase === 'friction') {
      const items = text
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      setState((prev) => ({ ...prev, draft: { ...prev.draft, challenges: clamp([...prev.draft.challenges, ...items], 12) } }));
      pushImmediate([userMessage(text)]);
      await goToTone();
      return;
    }

    // Tone custom entry
    if (state.phase === 'tone') {
      setState((prev) => ({ ...prev, draft: { ...prev.draft, tone: text } }));
      pushImmediate([userMessage(text)]);
      await goToInspiration();
      return;
    }

    // Avoid notes in confirm
    if (state.phase === 'confirm') {
      pushImmediate([userMessage(text)]);
      await startGeneration(text);
      return;
    }

    // Review: allow "save all" and "done"
    if (state.phase === 'review') {
      const lower = text.toLowerCase();
      if (lower.includes('save all')) {
        setState((prev) => ({
          ...prev,
          savedAffirmations: Array.from(new Set([...prev.savedAffirmations, ...prev.generatedAffirmations])),
        }));
        await pushAssistantWithTyping('Saved all.');
        return;
      }
    }

    await pushAssistantWithTyping(`I'm not sure what to do with that yet. Try the quick replies.`);
  };

  // Review UI (chat-driven)
  const currentAffirmation = state.generatedAffirmations[state.currentIndex] ?? null;
  const canShowReview = state.phase === 'review' && currentAffirmation;

  const reviewActions: QuickReply[] = useMemo(() => {
    if (!canShowReview) return [];
    return [
      { id: 'rv_like', label: 'I like it', value: '__like__' },
      { id: 'rv_skip', label: 'Not so much', value: '__skip__' },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canShowReview, state.currentIndex, state.generatedAffirmations.length, currentAffirmation]);

  useEffect(() => {
    if (!canShowReview) return;
    const alreadyShown = state.messages.some((m) => m.role === 'assistant' && m.text === currentAffirmation);
    if (alreadyShown) return;
    push([assistantMessage(currentAffirmation, reviewActions)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canShowReview, currentAffirmation]);

  const handleReviewQuickReply = (reply: QuickReply) => {
    if (!canShowReview) return;
    if (reply.value === '__like__') {
      push([userMessage('I like it')]);
      setState((prev) => {
        const savedAffirmations = prev.savedAffirmations.includes(currentAffirmation)
          ? prev.savedAffirmations
          : [...prev.savedAffirmations, currentAffirmation];
        const nextIndex = prev.currentIndex + 1;
        if (nextIndex >= prev.generatedAffirmations.length) {
          return {
            ...prev,
            savedAffirmations,
            phase: 'checkin',
            messages: [...prev.messages, makeCheckinMessage(prev.batchCount, savedAffirmations)],
          };
        }
        return { ...prev, savedAffirmations, currentIndex: nextIndex };
      });
      return;
    }
    if (reply.value === '__skip__') {
      push([userMessage('Not so much')]);
      setState((prev) => {
        const nextIndex = prev.currentIndex + 1;
        const skippedAffirmations = prev.skippedAffirmations.includes(currentAffirmation)
          ? prev.skippedAffirmations
          : [...prev.skippedAffirmations, currentAffirmation];
        if (nextIndex >= prev.generatedAffirmations.length) {
          return {
            ...prev,
            skippedAffirmations,
            phase: 'checkin',
            messages: [...prev.messages, makeCheckinMessage(prev.batchCount, prev.savedAffirmations)],
          };
        }
        return { ...prev, skippedAffirmations, currentIndex: nextIndex };
      });
      return;
    }
    if (reply.value === '__reset__') {
      push([userMessage('Reset')]);
      reset();
      return;
    }
  };

  const quickReplyHandler = (reply: QuickReply) => {
    if (state.phase === 'review') return handleReviewQuickReply(reply);
    return void handleQuickReply(reply);
  };

  const messagesWithSelection = useMemo(() => {
    const focus = state.draft.focus;
    const tone = state.draft.tone;
    const friction = state.draft.challenges[0] ?? null;
    const liked = new Set(state.draft.likedExamples);

    return state.messages.map((m) => {
      if (!m.quickReplies) return m;
      return {
        ...m,
        quickReplies: m.quickReplies.map((r) => {
          if (r.value === '__custom__' || r.value === '__skip__' || r.value === '__done__' || r.value.startsWith('__')) {
            return { ...r, selected: false };
          }
          const selected =
            r.value === focus || r.value === tone || r.value === friction || liked.has(r.value);
          return { ...r, selected };
        }),
      };
    });
  }, [state.draft.focus, state.draft.tone, state.draft.challenges, state.draft.likedExamples, state.messages, state.generatedAffirmations, state.currentIndex]);

  const showError = state.error ? (
    <div className="mt-3 p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
      {state.error}
    </div>
  ) : null;

  const header = (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h1 className="text-xl font-semibold">Full Process 03</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Chat-first onboarding to generate affirmations quickly.
        </p>
      </div>
      <button
        onClick={reset}
        className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        Reset
      </button>
    </div>
  );

  const step = (() => {
    if (state.phase === 'intro' || state.phase === 'focus') return { current: 1, total: 4, label: 'Focus' };
    if (state.phase === 'friction') return { current: 2, total: 4, label: 'Friction' };
    if (state.phase === 'tone') return { current: 3, total: 4, label: 'Voice' };
    if (state.phase === 'inspiration' || state.phase === 'confirm') return { current: 4, total: 4, label: 'Generate' };
    if (state.phase === 'generating') return { current: 4, total: 4, label: 'Generating' };
    if (state.phase === 'review') return { current: 4, total: 4, label: 'Review' };
    if (state.phase === 'checkin' || state.phase === 'adjust') return { current: 4, total: 4, label: 'Check-in' };
    return { current: 4, total: 4, label: 'Done' };
  })();

  // After each batch: step back and ask if we should adjust before generating more
  useEffect(() => {
    if (state.phase !== 'checkin') return;
    const marker = `[checkin:${state.batchCount}]`;
    const already = state.messages.some((m) => m.role === 'assistant' && m.text.includes(marker));
    if (already) return;

    push([makeCheckinMessage(state.batchCount, state.savedAffirmations)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.batchCount]);

  const goToAdjust = async () => {
    setPhase('adjust');
    await pushAssistantWithTyping(`What do you want to tweak?`, [
      { id: 'adj_tone', label: 'Tone', value: '__adj_tone__' },
      { id: 'adj_friction', label: 'Friction', value: '__adj_friction__' },
      { id: 'adj_focus', label: 'Focus', value: '__adj_focus__' },
      { id: 'adj_back', label: 'Back', value: '__adj_back__' },
    ]);
  };

  const makeCheckinMessage = (batchCount: number, savedAffirmations: string[]) => {
    const marker = `[checkin:${batchCount}]`;
    const savedPreview = savedAffirmations.slice(-6);
    const previewText = savedPreview.length ? savedPreview.map((a) => `• ${a}`).join('\n') : '• (none saved yet)';

    return assistantMessage(
      `Quick check-in ${marker}\n\nSaved so far: ${savedAffirmations.length}\n\nLatest saved:\n${previewText}\n\nAre we on the right track — or should we tweak anything before more?`,
      [
        { id: 'ci_more', label: 'Yes — give me more', value: '__more__' },
        { id: 'ci_adjust', label: 'Adjust', value: '__adjust__' },
        { id: 'ci_finish', label: 'Finish', value: '__finish__' },
      ]
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {header}

      <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Step <span className="font-medium">{step.current}</span>/{step.total} · {step.label}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 p-4">
        <ChatTranscript messages={messagesWithSelection} onQuickReply={quickReplyHandler} isTyping={isTyping} />
        <div ref={scrollRef} />
      </div>

      {showError}

      <div className="mt-4">
        <ChatComposer
          value={input}
          onChange={setInput}
          onSend={send}
          placeholder={isBusy ? 'Generating…' : 'Type here (optional)…'}
          disabled={isBusy}
        />
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Tip: Use quick replies for the fastest onboarding experience.
        </div>
      </div>

      {state.phase === 'done' && (
        <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Your saved affirmations</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Saved: <span className="font-medium">{state.savedAffirmations.length}</span>
              </p>
            </div>
            <button
              onClick={async () => {
                const text = state.savedAffirmations.map((a) => `- ${a}`).join('\n');
                try {
                  await navigator.clipboard.writeText(text);
                  push([assistantMessage('Copied to clipboard.')]);
                } catch {
                  push([assistantMessage('Copy failed (clipboard not available).')]);
                }
              }}
              className="text-sm px-3 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity"
            >
              Copy
            </button>
          </div>

          {state.savedAffirmations.length === 0 ? (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              You didn’t save any yet. Scroll up and tap “Save” on the ones you like, or reset and try again.
            </div>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {state.savedAffirmations.map((a) => (
                <li key={a} className="rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3">
                  {a}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}


