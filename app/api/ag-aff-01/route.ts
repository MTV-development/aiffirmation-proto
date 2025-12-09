import { Agent } from '@mastra/core/agent';
import { renderTemplate } from '@/src/services';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { themes, additionalContext, implementation } = await req.json();

  console.log('[AG-AFF-01] Request received:', {
    themes,
    additionalContext,
    implementation,
  });

  if (!themes || themes.length === 0) {
    return Response.json({ error: 'At least one theme is required' }, { status: 400 });
  }

  const implToUse = implementation || 'default';

  const userVariables = {
    themes,
    additionalContext: additionalContext?.trim() || null,
  };

  // Render both system and prompt using template engine
  const { output: systemPrompt, variables } = await renderTemplate({
    key: 'system',
    version: 'af-01',
    implementation: implToUse,
    variables: userVariables,
  });

  const { output: prompt } = await renderTemplate({
    key: 'prompt',
    version: 'af-01',
    implementation: implToUse,
    variables: userVariables,
  });

  console.log('[AG-AFF-01] Implementation:', implToUse);
  console.log('[AG-AFF-01] Variables:', variables);
  console.log('[AG-AFF-01] Rendered system prompt:', systemPrompt);
  console.log('[AG-AFF-01] Rendered prompt:', prompt);

  // Create agent with rendered system prompt
  const agent = new Agent({
    name: 'AF-1',
    instructions: systemPrompt,
    model: 'openai/gpt-4o-mini',
  });

  const result = await agent.generate(prompt);

  console.log('[AG-AFF-01] Generated result length:', result.text?.length);

  return Response.json({ affirmations: result.text });
}
