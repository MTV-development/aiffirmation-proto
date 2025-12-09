import { createAF01Agent } from '@/src/mastra/agents/ag-aff-01';
import { getAgentPromptTemplate } from '@/src/services';
import { NextRequest } from 'next/server';
import { Liquid } from 'liquidjs';

const liquid = new Liquid();

const DEFAULT_PROMPT_TEMPLATE = `Generate affirmations for the following themes: {{ themes | join: ", " }}.{% if additionalContext %}

Additional context from user: {{ additionalContext }}{% endif %}`;

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

  // Get prompt template from KV store
  const promptTemplate = await getAgentPromptTemplate('af-01', implToUse) || DEFAULT_PROMPT_TEMPLATE;
  const prompt = await buildPrompt(promptTemplate, themes, additionalContext);

  console.log('[AG-AFF-01] Creating agent with implementation:', implToUse);
  console.log('[AG-AFF-01] Prompt template:', promptTemplate);
  console.log('[AG-AFF-01] Built prompt:', prompt);

  // Create agent with system prompt from KV store
  const agent = await createAF01Agent(implToUse);

  console.log('[AG-AFF-01] Agent instructions:', agent.instructions);

  const result = await agent.generate(prompt);

  console.log('[AG-AFF-01] Generated result length:', result.text?.length);

  return Response.json({ affirmations: result.text });
}

async function buildPrompt(template: string, themes: string[], additionalContext?: string): Promise<string> {
  return liquid.parseAndRender(template, {
    themes,
    additionalContext: additionalContext?.trim() || null,
  });
}
