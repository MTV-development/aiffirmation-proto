import { mastra } from '@/src/mastra';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body;

  if (!message) {
    return Response.json({ error: 'No message provided' }, { status: 400 });
  }

  const agent = mastra.getAgent('weatherAgent');
  const result = await agent.generate(message);

  return Response.json({ response: result.text });
}
