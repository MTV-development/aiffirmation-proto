import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO05InfoPage() {
  return (
    <InfoPageWrapper id="FO-05" name="Full Onboarding (Sentence Fragments)" tagline="AI-generated sentence starters that lower the barrier to self-expression">
      <InfoSummaryBox>
        A guided onboarding flow where users can tap &quot;Inspiration&quot; to reveal AI-generated sentence
        fragments that help them get started. Instead of facing a blank input, users receive thoughtful
        sentence starters they can select and continue writing from.
        <BestFor>Best for users who know what they feel but struggle to find the words to begin.</BestFor>
      </InfoSummaryBox>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;The hardest part of writing is the first word.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          FO-05 removes the blank-page paralysis by offering sentence fragments as starting points.
          The AI provides the opening words; you provide the meaning. This lowers cognitive load while
          keeping the expression authentically yours.
        </p>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome through Topics</strong> - Same warm onboarding flow as FO-04</li>
          <li><strong>Dynamic Discovery</strong> - AI asks personalized questions with topic-aware first screen</li>
          <li><strong>Inspiration Button</strong> - Tap to reveal sentence fragment suggestions</li>
          <li><strong>Fragment Selection</strong> - Choose a starter that resonates and continue typing</li>
          <li><strong>Ready Screen</strong> - See a personalized summary of your journey before affirmations</li>
          <li><strong>Affirmation Generation</strong> - Click to create your personalized affirmations</li>
          <li><strong>Swipe Selection</strong> - Same iterative affirmation refinement as FO-04</li>
          <li><strong>Completion</strong> - View your curated list with a personalized journey summary</li>
        </ol>
      </InfoSection>

      {/* Key Difference */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-04</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-04</th>
                <th className="pb-2">FO-05</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Input assistance</td>
                <td className="py-1 pr-4">Chips as complete options</td>
                <td className="py-1">Sentence fragments as starters</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Assistance visibility</td>
                <td className="py-1 pr-4">Always visible</td>
                <td className="py-1">Hidden behind &quot;Inspiration&quot; button</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Selection behavior</td>
                <td className="py-1 pr-4">Chip replaces/toggles</td>
                <td className="py-1">Fragment appends to text</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Expected action</td>
                <td className="py-1 pr-4">Select and optionally add text</td>
                <td className="py-1">Select, then continue typing</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Writing friction</td>
                <td className="py-1 pr-4">Low (options provided)</td>
                <td className="py-1">Even lower (words provided)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <InfoSection title="Key Features">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>Inspiration button</strong> - Reveals fragment options on demand, keeping UI clean</li>
          <li><strong>Sentence fragments</strong> - Partial sentences like &quot;I have been feeling...&quot; or &quot;What I need most is...&quot;</li>
          <li><strong>Append behavior</strong> - Fragments add to existing text rather than replacing it</li>
          <li><strong>Topic-aware first screen</strong> - First question connects to selected topics</li>
          <li><strong>Continue typing flow</strong> - Cursor placed at end, inviting completion</li>
          <li><strong>Pre-affirmation summary</strong> - &quot;Ready&quot; screen shows your journey before generation</li>
          <li><strong>Post-affirmation summary</strong> - Completion screen connects your journey to your affirmations</li>
          <li><strong>Same affirmation flow</strong> - Swipe mechanics from FO-04 remain unchanged</li>
        </ul>
      </InfoSection>

      {/* Journey Summary Feature */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Journey Summaries</h3>
        <p className="text-purple-700 dark:text-purple-400 mb-3">
          FO-05 includes AI-generated personalized summaries that make users feel truly seen:
        </p>
        <div className="space-y-3 text-purple-700 dark:text-purple-400">
          <div className="pl-4 border-l-2 border-purple-300 dark:border-purple-600">
            <p className="font-medium">Pre-Affirmation Summary (&quot;Ready&quot; screen)</p>
            <p className="text-sm">Acknowledges what you&apos;ve shared and describes what affirmations <em>will be</em> created for you.</p>
          </div>
          <div className="pl-4 border-l-2 border-purple-300 dark:border-purple-600">
            <p className="font-medium">Post-Affirmation Summary (Completion screen)</p>
            <p className="text-sm">Connects your journey to the affirmations that <em>were</em> created, showing how they&apos;re designed to support you.</p>
          </div>
        </div>
      </section>

      {/* Fragment Examples */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Example Fragments</h3>
        <div className="space-y-2 text-blue-700 dark:text-blue-400">
          <p><strong>For emotional state questions:</strong></p>
          <ul className="list-disc list-inside ml-4 mb-3 space-y-1">
            <li>&quot;Lately I have been feeling...&quot;</li>
            <li>&quot;I notice that when...&quot;</li>
            <li>&quot;What weighs on me is...&quot;</li>
          </ul>
          <p><strong>For aspiration questions:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>&quot;I want to feel more...&quot;</li>
            <li>&quot;If I could change one thing...&quot;</li>
            <li>&quot;What would help me is...&quot;</li>
          </ul>
        </div>
      </section>

      {/* Why This Works */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Why Sentence Fragments Work</h3>
        <div className="space-y-2 text-amber-700 dark:text-amber-400">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Reduces cognitive load</strong> - Starting is harder than continuing</li>
            <li><strong>Maintains authenticity</strong> - You finish the thought in your words</li>
            <li><strong>Models vulnerability</strong> - Fragments demonstrate how to open up</li>
            <li><strong>Creates momentum</strong> - One fragment often triggers more thoughts</li>
            <li><strong>Feels collaborative</strong> - AI assists without taking over</li>
          </ul>
          <p className="mt-3 text-sm italic">
            The goal: help users past the blank-page paralysis while keeping their voice central.
          </p>
        </div>
      </section>

      <TechnicalDetails>
        <p className="mb-2"><strong>Agents:</strong></p>
        <ul className="list-disc list-inside mb-3 space-y-1">
          <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-05-discovery</code> - Dynamic screen generation with fragments</li>
          <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-05-affirmation</code> - Conversation-aware affirmation generation</li>
          <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-05-pre-summary</code> - Pre-affirmation journey summary</li>
          <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-05-post-summary</code> - Post-affirmation completion summary</li>
        </ul>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-05-*.*</code></p>
        <p>Base flow: Same as FO-04 with fragment input and journey summaries</p>
        <p>Fragment generation: 5 initial + 8 expanded fragments per screen</p>
        <p>Model: openai/gpt-4o-mini (temp 0.8-0.9)</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
