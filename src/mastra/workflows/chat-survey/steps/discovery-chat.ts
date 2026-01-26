import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { type ConversationMessage } from '../types';
import { discoveryAgent } from '../../../agents/chat-survey';

const MAX_TURNS = 7;

const discoveryResponseSchema = z.object({
  message: z.string(),
  suggestedResponses: z.array(z.string()).optional(),
  isComplete: z.boolean(),
  summary: z.string().optional(),
});

const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string().optional(),
});


export const discoveryChatStep = createStep({
  id: 'discovery-chat',
  inputSchema: z.object({
    skipDiscovery: z.boolean().optional(),
    conversationHistory: z.array(conversationMessageSchema).optional(),
  }),
  outputSchema: z.object({
    conversationHistory: z.array(conversationMessageSchema),
    isComplete: z.boolean(),
    summary: z.string().optional(),
  }),
  resumeSchema: z.object({
    conversationHistory: z.array(conversationMessageSchema).optional(),
    userMessage: z.string().optional(),
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    // If skipDiscovery is true, immediately complete with empty history
    if (inputData?.skipDiscovery) {
      return {
        conversationHistory: [],
        isComplete: true,
        summary: 'Discovery skipped - using exploration mode',
      };
    }

    // Start with conversation history from inputData (initial) or resumeData (subsequent calls)
    let conversationHistory: ConversationMessage[] = resumeData?.conversationHistory || inputData?.conversationHistory || [];

    // If we have a user message in resumeData, add it to history
    if (resumeData?.userMessage) {
      conversationHistory = [
        ...conversationHistory,
        {
          role: 'user',
          content: resumeData.userMessage,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    const turnNumber = Math.floor(conversationHistory.length / 2) + 1;

    // Build conversation context for agent
    const conversationContext = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Generate agent response
    const prompt = conversationHistory.length === 0
      ? 'Start the discovery conversation. Ask an opening question to understand what brings the user here.'
      : `Continue the conversation. Here's the history:\n\n${conversationContext}\n\nRespond to the user's last message and ask a follow-up question if needed.`;

    const response = await discoveryAgent.generate(prompt);

    // Parse agent response
    let parsedResponse: z.infer<typeof discoveryResponseSchema>;
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = discoveryResponseSchema.parse(JSON.parse(jsonMatch[0]));
      } else {
        // Fallback if agent doesn't return JSON
        parsedResponse = {
          message: response.text,
          suggestedResponses: [],
          isComplete: turnNumber >= MAX_TURNS,
        };
      }
    } catch {
      parsedResponse = {
        message: response.text,
        suggestedResponses: [],
        isComplete: turnNumber >= MAX_TURNS,
      };
    }

    // Add assistant message to history
    const updatedHistory: ConversationMessage[] = [
      ...conversationHistory,
      {
        role: 'assistant',
        content: parsedResponse.message,
        timestamp: new Date().toISOString(),
      },
    ];

    // Check completion conditions: agent says complete OR max turns reached
    const isComplete = parsedResponse.isComplete || turnNumber >= MAX_TURNS;

    if (isComplete) {
      return {
        conversationHistory: updatedHistory,
        isComplete: true,
        summary: parsedResponse.summary,
      };
    }

    // Suspend and wait for user response - pass current history for next resume
    return suspend({
      conversationHistory: updatedHistory,
      assistantMessage: parsedResponse.message,
      turnNumber,
      suggestedResponses: parsedResponse.suggestedResponses,
    });
  },
});
