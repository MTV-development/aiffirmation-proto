import { mastra } from '@/src/mastra';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { themes, additionalContext } = await req.json();

  if (!themes || themes.length === 0) {
    return Response.json({ error: 'At least one theme is required' }, { status: 400 });
  }

  const prompt = buildPrompt(themes, additionalContext);

  const agent = mastra.getAgent('af1Agent');
  const result = await agent.generate(prompt);

  return Response.json({ affirmations: result.text });
}

function buildPrompt(themes: string[], additionalContext?: string): string {
  let prompt = `Generate 10 affirmations for the following themes: ${themes.join(', ')}.`;

  if (additionalContext?.trim()) {
    prompt += `\n\nAdditional context from user: ${additionalContext}`;
  }

  return prompt;
}
