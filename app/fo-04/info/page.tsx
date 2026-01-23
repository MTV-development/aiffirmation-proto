import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO04InfoPage() {
  return (
    <InfoPageWrapper id="FO-04" name="Full Onboarding (Dynamic Discovery)" tagline="AI-generated detail-gathering screens that adapt to what users share">
      <InfoSummaryBox>
        A dynamic onboarding flow where the AI generates personalized questions based on what the user
        has already shared. Instead of hardcoded screens, 2-5 adaptive screens progressively gather
        context to create deeply personalized affirmations.
        <BestFor>Best for users who want a conversational experience that feels like being truly understood.</BestFor>
      </InfoSummaryBox>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;The questions themselves make you feel seen.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          FO-04 treats onboarding as part of the emotional experience. The AI adapts its questions to what you share,
          creating a warm, conversational flow that feels personal rather than formulaic.
        </p>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome</strong> - Warm introduction to set the tone</li>
          <li><strong>Name</strong> - Personal greeting to establish connection</li>
          <li><strong>Welcome Back</strong> - Personalized welcome with name</li>
          <li><strong>Familiarity</strong> - Easy warm-up question (new/some/very familiar)</li>
          <li><strong>Topics</strong> - Multi-select chips for areas of focus</li>
          <li><strong>Dynamic Discovery (2-5 screens)</strong> - AI-generated questions with reflective statements</li>
          <li><strong>Swipe Selection</strong> - Iterative batch generation with feedback</li>
          <li><strong>Background</strong> - Visual personalization (mockup)</li>
          <li><strong>Notifications</strong> - Reminder preferences (mockup)</li>
          <li><strong>Paywall</strong> - Premium offering (mockup)</li>
          <li><strong>Completion</strong> - View your curated affirmation list</li>
        </ol>
      </InfoSection>

      {/* Key Difference */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-03</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-03</th>
                <th className="pb-2">FO-04</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Detail screens</td>
                <td className="py-1 pr-4">Hardcoded questions</td>
                <td className="py-1">AI-generated questions</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Screen count</td>
                <td className="py-1 pr-4">Fixed (3 screens)</td>
                <td className="py-1">Adaptive (2-5 screens)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Chips</td>
                <td className="py-1 pr-4">Predefined options</td>
                <td className="py-1">AI-generated based on context</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Chip UX</td>
                <td className="py-1 pr-4">Toggle in place</td>
                <td className="py-1">Insert into input field</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Reflective statements</td>
                <td className="py-1 pr-4">None</td>
                <td className="py-1">AI summarizes what it has learned</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <InfoSection title="Key Features">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>Reflective statements</strong> - AI summarizes what it has learned about you before each question</li>
          <li><strong>Chip-in-input UX</strong> - Chips appear inside the input field as tags, combined with free text</li>
          <li><strong>Adaptive screen count</strong> - Agent decides when enough context has been gathered (2-5 screens)</li>
          <li><strong>Context-aware chips</strong> - Suggestions are generated based on your previous answers</li>
          <li><strong>Expand option</strong> - &quot;Show more&quot; reveals additional chip suggestions</li>
          <li><strong>No skip option</strong> - Agent controls the flow, ensuring quality context collection</li>
          <li><strong>Same swipe mechanics</strong> - Iterative feedback loop from FO-02/FO-03</li>
        </ul>
      </InfoSection>

      {/* Dynamic Screen Structure */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Dynamic Screen Structure</h3>
        <div className="space-y-2 text-blue-700 dark:text-blue-400">
          <p><strong>Each AI-generated screen contains:</strong></p>
          <ol className="list-decimal list-inside ml-4 mb-3">
            <li><strong>Reflective statement</strong> - Summarizes what we have learned (omitted on first screen)</li>
            <li><strong>Question</strong> - Invites more detail in warm, conversational language</li>
            <li><strong>Input field</strong> - Free-text with inline chip support</li>
            <li><strong>Suggestion chips</strong> - AI-generated options with + prefix</li>
            <li><strong>Expand option</strong> - &quot;Show more&quot; for additional suggestions</li>
          </ol>
          <p><strong>First screen:</strong> No reflective statement, asks &quot;What has been going on lately that brought you here?&quot;</p>
        </div>
      </section>

      {/* What the Agent Gathers */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">What the Agent Seeks to Understand</h3>
        <div className="space-y-2 text-amber-700 dark:text-amber-400">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Emotional baseline</strong> - Current state to match tone and intensity</li>
            <li><strong>Inner dialogue</strong> - How you talk to yourself, to craft resonant counter-phrases</li>
            <li><strong>Needs and longings</strong> - What you want more of or less of</li>
            <li><strong>Believability threshold</strong> - What you can emotionally accept today</li>
            <li><strong>Life context</strong> - Where this shows up in your life (light touch)</li>
          </ul>
          <p className="mt-3 text-sm italic">
            The goal: affirmations that feel like &quot;This understands me - and I can actually say this to myself.&quot;
          </p>
        </div>
      </section>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-04</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-04.*</code></p>
        <p>Dynamic screens: 2-5 (agent-controlled)</p>
        <p>Screen termination: Agent confidence signal + min/max enforcement</p>
        <p>Spec document: <a href="/docs/projects/2026-01-23-FO-04/2026-01-23-FO-04-spec.md" className="text-blue-600 dark:text-blue-400 underline">docs/projects/2026-01-23-FO-04/2026-01-23-FO-04-spec.md</a></p>
        <p>Model: openai/gpt-4o-mini (temp 0.9)</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
