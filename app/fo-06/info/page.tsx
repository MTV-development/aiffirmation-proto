import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO06InfoPage() {
  return (
    <InfoPageWrapper id="FO-06" name="Full Onboarding (Focused Discovery)" tagline="Focused three-part discovery without topic selection">
      <InfoSummaryBox>
        A focused onboarding experience with welcome and familiarity screens, but no topic selection.
        Uses a fixed opening question and three-part discovery (situation → problem → desired outcome).
        No progress bar to reduce cognitive load during the investigation phase.
        <BestFor>Best for users who want guided discovery without choosing topics upfront.</BestFor>
      </InfoSummaryBox>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Understand why you&apos;re here, what&apos;s hard, and how you want to feel.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          FO-06 uses a structured three-part discovery: (1) what brought you here, (2) the specific challenge,
          (3) desired outcome. No topic selection — the AI discovers your needs through conversation.
          No progress bar during investigation to reduce cognitive load.
        </p>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome Screens</strong> - Introduction and name input (same as FO-05)</li>
          <li><strong>Familiarity</strong> - How familiar are you with affirmations?</li>
          <li><strong>Fixed Opening Question</strong> - &quot;What&apos;s going on in your life right now that made you seek out affirmations?&quot;</li>
          <li><strong>Three-Part Discovery</strong> - AI gathers: (1) what brought them here, (2) the specific problem/challenge, (3) desired outcome</li>
          <li><strong>Auto-Transition</strong> - Proceeds to affirmations once all three are understood (typically 2-3 exchanges)</li>
          <li><strong>Swipe Selection</strong> - Review and select affirmations (same UI as FO-05)</li>
          <li><strong>Completion</strong> - View your curated affirmation list</li>
        </ol>
      </InfoSection>

      {/* Key Difference */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-05</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-05</th>
                <th className="pb-2">FO-06</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Topic selection</td>
                <td className="py-1 pr-4">User chooses topics upfront</td>
                <td className="py-1">No topic selection — discovered via conversation</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">First question</td>
                <td className="py-1 pr-4">Topic-aware dynamic question</td>
                <td className="py-1">Fixed opening question</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Discovery approach</td>
                <td className="py-1 pr-4">Open-ended exploration</td>
                <td className="py-1">Three-part: situation → problem → desired outcome</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Progress indicator</td>
                <td className="py-1 pr-4">Visible progress bar</td>
                <td className="py-1">No progress bar</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Fragment UI</td>
                <td className="py-1 pr-4">Sentence fragment assistance</td>
                <td className="py-1">Sentence starters (users complete the thought)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <InfoSection title="Key Features">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>No progress bar</strong> - Removes step-counting anxiety during investigation</li>
          <li><strong>No topic selection</strong> - AI discovers needs through conversation instead</li>
          <li><strong>Fixed opening question</strong> - Consistent entry point for all users</li>
          <li><strong>Three-part discovery</strong> - AI gathers situation, problem, and desired outcome in order</li>
          <li><strong>Sentence starter fragments</strong> - Both initial and expanded fragments are incomplete prompts users complete</li>
          <li><strong>Smart transition</strong> - Auto-proceeds to affirmations when all three elements are gathered (2-3 exchanges)</li>
        </ul>
      </InfoSection>

      {/* Why Focused Discovery Works */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Why Focused Discovery Works</h3>
        <div className="space-y-2 text-amber-700 dark:text-amber-400">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Structured approach</strong> - Three-part discovery ensures we gather what we need</li>
            <li><strong>Direct engagement</strong> - Fixed opening question gets to the heart of why users are here</li>
            <li><strong>No upfront decisions</strong> - No topic selection means users don&apos;t have to categorize their needs</li>
            <li><strong>No progress pressure</strong> - Users focus on sharing, not completing steps</li>
            <li><strong>Smart completion</strong> - AI recognizes when it has enough and moves on automatically</li>
          </ul>
          <p className="mt-3 text-sm italic">
            The goal: understand why you&apos;re here, what&apos;s challenging, and how you want to feel — then create affirmations that hit the mark.
          </p>
        </div>
      </section>

      <TechnicalDetails>
        <p className="mb-2"><strong>Agents:</strong></p>
        <ul className="list-disc list-inside mb-3 space-y-1">
          <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-06-discovery</code> - Three-part discovery (situation → problem → desired outcome)</li>
          <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-06-affirmation</code> - Context-aware affirmation generation</li>
        </ul>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-06-*.*</code></p>
        <p>Steps 0-2: Welcome screens | Step 3: Familiarity | Steps 4-8: Dynamic discovery</p>
        <p>Opening question: Fixed (&quot;What&apos;s going on in your life right now that made you seek out affirmations?&quot;)</p>
        <p>Discovery: Gathers situation, problem, and desired outcome (2-3 exchanges typical)</p>
        <p>Fragments: Sentence starters (initial + expanded) that users complete</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
