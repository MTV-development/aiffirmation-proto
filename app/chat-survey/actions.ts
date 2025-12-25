'use server';

import { mastra } from '@/src/mastra';
import {
  chatResumeDataSchema,
  swipeResumeDataSchema,
} from '@/src/mastra/workflows/chat-survey';

// Get the workflow from Mastra instance (has storage configured)
// The type assertion is needed due to complex union types in Mastra's getWorkflow
const getWorkflow = () => {
  // Bind to mastra instance to preserve 'this' context, then call with workflow ID
  const boundGetWorkflow = mastra.getWorkflow.bind(mastra) as (id: string) => ReturnType<typeof mastra.getWorkflow>;
  return boundGetWorkflow('chatSurveyWorkflow');
};

// Type definitions for server action responses
export interface WorkflowStartResult {
  runId: string;
  status: 'running' | 'suspended' | 'completed' | 'success' | 'failed';
  suspendedData?: {
    step: string;
    assistantMessage?: string;
    turnNumber?: number;
    suggestedResponses?: string[];
    affirmation?: string;
    index?: number;
    // Include conversation history so client can pass it back on next call
    conversationHistory?: Array<{ role: string; content: string; timestamp?: string }>;
    // Include swipe state for generate-stream step
    swipeState?: {
      profile?: unknown;
      approvedAffirmations?: string[];
      skippedAffirmations?: string[];
      currentIndex?: number;
    };
  };
  error?: string;
}

export interface SessionStateResult {
  exists: boolean;
  status?: 'running' | 'suspended' | 'completed' | 'success' | 'failed';
  phase?: 'chat' | 'swipe';
  savedCount?: number;
  suspendedData?: WorkflowStartResult['suspendedData'];
  error?: string;
}

export interface SavedAffirmationsResult {
  affirmations: string[];
  error?: string;
}

// Helper to format workflow result
function formatWorkflowResult(result: {
  runId?: string;
  status?: string;
  suspended?: unknown;
  steps?: Record<string, { output?: unknown; suspendPayload?: unknown }>;
}): WorkflowStartResult {
  let suspendedData: WorkflowStartResult['suspendedData'] | undefined;

  // The suspended field can be either:
  // 1. Array of arrays: [["step-name"]] (from Mastra)
  // 2. Array of objects: [{ step, payload }] (old format)
  // The actual payload is in steps[stepName].suspendPayload

  if (result.suspended && result.steps) {
    // Get the suspended step name
    let suspendedStepName: string | undefined;

    if (Array.isArray(result.suspended) && result.suspended.length > 0) {
      const first = result.suspended[0];
      if (Array.isArray(first) && first.length > 0) {
        // Format: [["discovery-chat"]]
        suspendedStepName = first[0] as string;
      } else if (typeof first === 'object' && first !== null && 'step' in first) {
        // Format: [{ step: "discovery-chat", payload: ... }]
        suspendedStepName = (first as { step: string }).step;
      }
    }

    if (suspendedStepName && result.steps[suspendedStepName]) {
      const stepData = result.steps[suspendedStepName];
      const payload = stepData.suspendPayload as Record<string, unknown> | undefined;

      if (suspendedStepName === 'discovery-chat' && payload) {
        suspendedData = {
          step: 'discovery-chat',
          assistantMessage: payload.assistantMessage as string,
          turnNumber: payload.turnNumber as number,
          suggestedResponses: payload.suggestedResponses as string[],
          // Include conversation history so client can pass it back
          conversationHistory: payload.conversationHistory as Array<{ role: string; content: string; timestamp?: string }>,
        };
      } else if (suspendedStepName === 'generate-stream' && payload) {
        suspendedData = {
          step: 'generate-stream',
          affirmation: payload.affirmation as string,
          index: payload.index as number,
          // Include swipe state for client to pass back
          swipeState: {
            profile: payload.profile,
            approvedAffirmations: payload.approvedAffirmations as string[] || [],
            skippedAffirmations: payload.skippedAffirmations as string[] || [],
            currentIndex: payload.currentIndex as number || 0,
          },
        };
      }
    }
  }

  console.log('[Server] formatWorkflowResult suspendedData:', suspendedData);

  return {
    runId: result.runId || '',
    status: (result.status as WorkflowStartResult['status']) || 'running',
    suspendedData,
  };
}

/**
 * T021: Start a new chat-survey session
 */
export async function startChatSurvey(): Promise<WorkflowStartResult> {
  console.log('[Server] startChatSurvey called');
  try {
    const workflow = getWorkflow();
    console.log('[Server] Got workflow:', workflow?.id);
    const run = await workflow.createRunAsync();
    console.log('[Server] Created run:', run.runId);
    const result = await run.start({
      inputData: { skipDiscovery: false },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultAny = result as any;
    console.log('[Server] startChatSurvey raw result:', JSON.stringify(resultAny, null, 2));

    return formatWorkflowResult({
      runId: run.runId,
      status: resultAny.status,
      suspended: resultAny.status === 'suspended' ? resultAny.suspended : undefined,
      steps: resultAny.steps,
    });
  } catch (error) {
    console.error('startChatSurvey error:', error);
    return {
      runId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to start session',
    };
  }
}

/**
 * T022: Resume chat survey with user message
 * Client must pass conversationHistory from the previous response's suspendedData
 */
export async function resumeChatSurvey(
  runId: string,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string; timestamp?: string }> = []
): Promise<WorkflowStartResult> {
  console.log('[Server] resumeChatSurvey called', { runId, userMessage, historyLength: conversationHistory.length });
  try {
    // Validate input
    const parsed = chatResumeDataSchema.safeParse({ userMessage });
    if (!parsed.success) {
      console.log('[Server] Invalid message format');
      return {
        runId,
        status: 'failed',
        error: 'Invalid message',
      };
    }

    // Resume the workflow with the conversation history passed from client
    const workflow = getWorkflow();
    const run = await workflow.createRunAsync({ runId });

    const result = await run.resume({
      step: 'discovery-chat',
      resumeData: { userMessage, conversationHistory },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log('[Server] resumeChatSurvey raw result:', JSON.stringify(result as any, null, 2));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultAny = result as any;

    return formatWorkflowResult({
      runId,
      status: resultAny.status,
      suspended: resultAny.status === 'suspended' ? resultAny.suspended : undefined,
      steps: resultAny.steps,
    });
  } catch (error) {
    console.error('resumeChatSurvey error:', error);
    return {
      runId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to resume chat',
    };
  }
}

/**
 * T023: Process a swipe action
 * swipeState contains the state from the previous suspendedData (profile, approvedAffirmations, etc.)
 */
export async function swipeAffirmation(
  runId: string,
  action: 'approve' | 'skip',
  affirmation: string,
  swipeState?: {
    profile?: unknown;
    approvedAffirmations?: string[];
    skippedAffirmations?: string[];
    currentIndex?: number;
  }
): Promise<WorkflowStartResult> {
  console.log('[Server] swipeAffirmation called', { runId, action, swipeStateKeys: Object.keys(swipeState || {}) });
  try {
    // Validate input
    const parsed = swipeResumeDataSchema.safeParse({ action, affirmation });
    if (!parsed.success) {
      return {
        runId,
        status: 'failed',
        error: 'Invalid swipe action',
      };
    }

    // Resume the workflow with state from previous suspend
    const workflow = getWorkflow();
    const run = await workflow.createRunAsync({ runId });
    const result = await run.resume({
      step: 'generate-stream',
      resumeData: {
        action,
        affirmation,
        // Include state from previous suspend
        profile: swipeState?.profile,
        approvedAffirmations: swipeState?.approvedAffirmations || [],
        skippedAffirmations: swipeState?.skippedAffirmations || [],
        currentIndex: swipeState?.currentIndex || 0,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultAny = result as any;
    console.log('[Server] swipeAffirmation raw result:', JSON.stringify(resultAny, null, 2));

    return formatWorkflowResult({
      runId,
      status: resultAny.status,
      suspended: resultAny.status === 'suspended' ? resultAny.suspended : undefined,
      steps: resultAny.steps,
    });
  } catch (error) {
    console.error('swipeAffirmation error:', error);
    return {
      runId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to process swipe',
    };
  }
}

/**
 * Skip discovery and go directly to swipe mode (US2 - implemented as stub)
 */
export async function skipToSwipe(_runId?: string): Promise<WorkflowStartResult> {
  try {
    // Start new workflow with skipDiscovery flag
    const workflow = getWorkflow();
    const run = await workflow.createRunAsync();
    const result = await run.start({
      inputData: { skipDiscovery: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultAny = result as any;

    return formatWorkflowResult({
      runId: run.runId,
      status: resultAny.status,
      suspended: resultAny.status === 'suspended' ? resultAny.suspended : undefined,
      steps: resultAny.steps,
    });
  } catch (error) {
    console.error('skipToSwipe error:', error);
    return {
      runId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to skip to swipe',
    };
  }
}

/**
 * Get current session state (US3)
 */
export async function getSessionState(runId: string): Promise<SessionStateResult> {
  try {
    const workflow = getWorkflow();
    const run = await workflow.createRunAsync({ runId });
    const state = await run.getState();

    if (!state) {
      return { exists: false };
    }

    // Determine phase based on suspended step or completed steps
    let phase: 'chat' | 'swipe' = 'chat';
    const suspended = state.suspended as Array<{ step: string }> | undefined;
    const steps = state.steps as Record<string, { status?: string }> | undefined;

    if (suspended?.some(s => s.step === 'generate-stream') || steps?.['profile-builder']?.status === 'success') {
      phase = 'swipe';
    }

    // Get saved count
    const generateResult = steps?.['generate-stream'] as { output?: { approvedAffirmations?: string[] } } | undefined;
    const savedCount = generateResult?.output?.approvedAffirmations?.length || 0;

    const formatted = formatWorkflowResult({
      runId,
      status: state.status as string,
      suspended: suspended as Array<{ step: string; payload?: unknown }>,
      steps: steps as Record<string, { output?: unknown }>,
    });

    return {
      exists: true,
      status: formatted.status,
      phase,
      savedCount,
      suspendedData: formatted.suspendedData,
    };
  } catch (error) {
    console.error('getSessionState error:', error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Failed to get session state',
    };
  }
}

/**
 * Get saved affirmations (US4)
 */
export async function getSavedAffirmations(runId: string): Promise<SavedAffirmationsResult> {
  try {
    const workflow = getWorkflow();
    const run = await workflow.createRunAsync({ runId });
    const state = await run.getState();

    const steps = state?.steps as Record<string, { output?: { approvedAffirmations?: string[] } }> | undefined;
    const generateResult = steps?.['generate-stream'];

    return {
      affirmations: generateResult?.output?.approvedAffirmations || [],
    };
  } catch (error) {
    console.error('getSavedAffirmations error:', error);
    return {
      affirmations: [],
      error: error instanceof Error ? error.message : 'Failed to get saved affirmations',
    };
  }
}

/**
 * Remove a saved affirmation (US4)
 */
export async function removeSavedAffirmation(
  _runId: string,
  _affirmation: string
): Promise<{ success: boolean; error?: string }> {
  // Note: This would require modifying workflow state directly
  // For MVP, we can track removals client-side
  console.warn('removeSavedAffirmation not fully implemented - tracking client-side');
  return { success: true };
}
