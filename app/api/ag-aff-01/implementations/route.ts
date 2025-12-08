import { getAgentImplementations } from '@/src/services';

export async function GET() {
  const implementations = await getAgentImplementations('af-01');

  // Ensure 'default' is always first if it exists
  const sorted = implementations.sort((a, b) => {
    if (a === 'default') return -1;
    if (b === 'default') return 1;
    return a.localeCompare(b);
  });

  return Response.json({ implementations: sorted });
}
