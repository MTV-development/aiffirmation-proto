import { z } from 'zod';

// Conversation Message
export const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
  timestamp: z.string().optional(),
});

// Tone Preference
export const tonePreferenceSchema = z.enum([
  'gentle',
  'assertive',
  'balanced',
  'spiritual'
]);

// User Profile
export const userProfileSchema = z.object({
  themes: z.array(z.string()).min(1),
  challenges: z.array(z.string()),
  tone: tonePreferenceSchema,
  insights: z.array(z.string()),
  conversationSummary: z.string().max(500),
});

// Workflow State
export const workflowStateSchema = z.object({
  conversationHistory: z.array(conversationMessageSchema).optional(),
  userProfile: userProfileSchema.optional(),
  approvedAffirmations: z.array(z.string()).optional(),
  skippedAffirmations: z.array(z.string()).optional(),
  generatedAffirmations: z.array(z.string()).optional(),
});

// Suspend Payloads
export const chatSuspendPayloadSchema = z.object({
  conversationHistory: z.array(conversationMessageSchema),
  assistantMessage: z.string(),
  turnNumber: z.number(),
  suggestedResponses: z.array(z.string()).optional(),
});

export const swipeSuspendPayloadSchema = z.object({
  affirmation: z.string(),
  index: z.number(),
});

// Resume Data
export const chatResumeDataSchema = z.object({
  userMessage: z.string().min(1),
  conversationHistory: z.array(conversationMessageSchema).optional(),
});

export const swipeResumeDataSchema = z.object({
  action: z.enum(['approve', 'skip']),
  affirmation: z.string(),
});

// TypeScript types derived from Zod schemas
export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type TonePreference = z.infer<typeof tonePreferenceSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type WorkflowState = z.infer<typeof workflowStateSchema>;
export type ChatSuspendPayload = z.infer<typeof chatSuspendPayloadSchema>;
export type SwipeSuspendPayload = z.infer<typeof swipeSuspendPayloadSchema>;
export type ChatResumeData = z.infer<typeof chatResumeDataSchema>;
export type SwipeResumeData = z.infer<typeof swipeResumeDataSchema>;
