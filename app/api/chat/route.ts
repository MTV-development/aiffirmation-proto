import { mastra } from '@/mastra';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const agent = mastra.getAgent('weatherAgent');
  const result = await agent.generate(message);

  return Response.json({ response: result.text });
}
