import { Agent } from '@mastra/core/agent';
import { renderTemplate } from '@/src/services';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { themes, additionalContext, implementation } = await req.json();

  console.log('[AG-GOOD-TEN] Request received:', {
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
    themeCount: themes.length,
    additionalContext: additionalContext?.trim() || null,
  };

  // Render both system and prompt using template engine
  const { output: systemPrompt, variables } = await renderTemplate({
    key: 'system',
    version: 'gt-01',
    implementation: implToUse,
    variables: userVariables,
  });

  const { output: prompt } = await renderTemplate({
    key: 'prompt',
    version: 'gt-01',
    implementation: implToUse,
    variables: userVariables,
  });

  console.log('[AG-GOOD-TEN] Implementation:', implToUse);
  console.log('[AG-GOOD-TEN] Variables:', variables);
  console.log('[AG-GOOD-TEN] Rendered system prompt:', systemPrompt);
  console.log('[AG-GOOD-TEN] Rendered prompt:', prompt);

  // Create agent with rendered system prompt
  const agent = new Agent({
    name: 'Good-Ten',
    instructions: systemPrompt,
    model: 'openai/gpt-4o-mini',
  });

  const result = await agent.generate(prompt);

  console.log('[AG-GOOD-TEN] Generated result length:', result.text?.length);

  return Response.json({ affirmations: result.text });
}
