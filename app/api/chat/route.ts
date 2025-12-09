import { weatherAgent } from '@/src/mastra/agents/weather-agent';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const result = await weatherAgent.generate(message);

  return Response.json({ response: result.text });
}
