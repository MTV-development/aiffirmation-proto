import { createAF01Agent } from '@/src/mastra/agents/ag-aff-01';
import { renderTemplate, getTemplateText } from '@/src/services';
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

  // Render prompt using template engine
  const { output: prompt, variables } = await renderTemplate({
    key: 'prompt',
    version: 'af-01',
    implementation: implToUse,
    variables: {
      themes,
      additionalContext: additionalContext?.trim() || null,
    },
  });

  console.log('[AG-AFF-01] Implementation:', implToUse);
  console.log('[AG-AFF-01] Variables:', variables);
  console.log('[AG-AFF-01] Rendered prompt:', prompt);

  // Get system prompt and create agent
  const systemPrompt = await getTemplateText('system', 'af-01', implToUse);
  const agent = await createAF01Agent(implToUse);

  console.log('[AG-AFF-01] System prompt:', systemPrompt?.slice(0, 100) + '...');

  const result = await agent.generate(prompt);

  console.log('[AG-AFF-01] Generated result length:', result.text?.length);

  return Response.json({ affirmations: result.text });
}
