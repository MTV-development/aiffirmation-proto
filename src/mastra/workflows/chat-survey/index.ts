import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  workflowStateSchema,
  chatSuspendPayloadSchema,
  swipeSuspendPayloadSchema,
  chatResumeDataSchema,
  swipeResumeDataSchema,
  type WorkflowState,
} from './types';
import { discoveryChatStep } from './steps/discovery-chat';
import { profileBuilderStep } from './steps/profile-builder';
import { generateStreamStep } from './steps/generate-stream';

// Workflow definition connecting all three steps
export const chatSurveyWorkflow = createWorkflow({
  id: 'chat-survey-workflow',
  inputSchema: z.object({
    skipDiscovery: z.boolean().optional(),
  }),
  outputSchema: z.object({
    approvedAffirmations: z.array(z.string()),
  }),
})
  .then(discoveryChatStep)
  .then(profileBuilderStep)
  .then(generateStreamStep)
  .commit();

// Export types for use in server actions
export type { WorkflowState };
export {
  workflowStateSchema,
  chatSuspendPayloadSchema,
  swipeSuspendPayloadSchema,
  chatResumeDataSchema,
  swipeResumeDataSchema,
};

// Export steps for direct access if needed
export { discoveryChatStep, profileBuilderStep, generateStreamStep };
