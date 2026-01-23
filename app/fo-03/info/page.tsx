import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO03InfoPage() {
  return (
    <InfoPageWrapper id="FO-03" name="Full Onboarding (Gradual)" tagline="Multi-question onboarding with toggleable inspiration chips for lower friction input">
      <InfoSummaryBox>
        A gradual onboarding flow that warms users up with easy questions before asking for longer input.
        Uses toggleable inspiration chips alongside open text fields to reduce friction and collect richer
        context (feelings, situation, what helps) for more personalized affirmations.
        <BestFor>Best for users who want guided input options while still having freedom to express themselves.</BestFor>
      </InfoSummaryBox>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Start easy, go deeper, get personal.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          FO-03 reduces input friction by offering inspiration chips users can toggle, while still allowing free text for deeper expression.
        </p>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome</strong> - Warm introduction to set the tone</li>
          <li><strong>Name</strong> - Personal greeting to establish connection</li>
          <li><strong>Welcome Back</strong> - Personalized welcome with name</li>
          <li><strong>Familiarity</strong> - Easy warm-up question (new/some/very familiar)</li>
          <li><strong>Topics</strong> - Multi-select chips for areas of focus</li>
          <li><strong>What&apos;s Going On</strong> - Open text + toggleable situation chips</li>
          <li><strong>Current Feelings</strong> - Open text + toggleable emotion chips</li>
          <li><strong>What Helps</strong> - Open text + toggleable comfort chips</li>
          <li><strong>Swipe Selection</strong> - Iterative batch generation with feedback</li>
          <li><strong>Background</strong> - Visual personalization (mockup)</li>
          <li><strong>Notifications</strong> - Reminder preferences (mockup)</li>
          <li><strong>Paywall</strong> - Premium offering (mockup)</li>
          <li><strong>Completion</strong> - View your curated affirmation list</li>
        </ol>
      </InfoSection>

      {/* Key Difference */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-01/FO-02</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-01/02</th>
                <th className="pb-2">FO-03</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Input method</td>
                <td className="py-1 pr-4">Single open text field</td>
                <td className="py-1">Multiple questions + chips + text</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Warm-up</td>
                <td className="py-1 pr-4">None</td>
                <td className="py-1">Easy familiarity question first</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Context collected</td>
                <td className="py-1 pr-4">Intention only</td>
                <td className="py-1">Topics + situation + feelings + what helps</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Skip option</td>
                <td className="py-1 pr-4">No</td>
                <td className="py-1">&quot;Not sure&quot; skips step</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <InfoSection title="Key Features">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>Gradual warm-up</strong> - Easy questions before deeper input</li>
          <li><strong>Toggleable inspiration chips</strong> - Select multiple alongside typed text</li>
          <li><strong>Rich context collection</strong> - Topics, situation, feelings, and what helps</li>
          <li><strong>Skip-friendly</strong> - &quot;Not sure&quot; option on every input step</li>
          <li><strong>Iterative swipe learning</strong> - Same feedback loop as FO-02</li>
          <li><strong>Animated transitions</strong> - Confetti and heart animations between steps</li>
          <li><strong>Explicit list-building</strong> - Clear messaging about building personal list</li>
        </ul>
      </InfoSection>

      {/* Input Structure */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Input Structure</h3>
        <div className="space-y-2 text-blue-700 dark:text-blue-400">
          <p><strong>What we collect:</strong></p>
          <ul className="list-disc list-inside ml-4 mb-3">
            <li><strong>Name</strong> - For personalized messaging</li>
            <li><strong>Familiarity</strong> - New / Some experience / Very familiar</li>
            <li><strong>Topics</strong> - Multi-select from 36 topic chips</li>
            <li><strong>Situation</strong> - Free text + chips (what brought you here)</li>
            <li><strong>Feelings</strong> - Free text + chips (current emotional state)</li>
            <li><strong>What helps</strong> - Free text + chips (comfort preferences)</li>
          </ul>
          <p><strong>All fields except name are optional</strong> - users can skip any step with &quot;Not sure&quot;</p>
        </div>
      </section>

      {/* Chip Categories */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Inspiration Chips</h3>
        <div className="space-y-3 text-amber-700 dark:text-amber-400">
          <p><strong>Topics:</strong> Motivation, Focus, Inner peace, Self-worth, Healing, Gratitude, Resilience, Anxiety relief, Confidence, and 26 more</p>
          <p><strong>Situation:</strong> Feeling stuck, Relationship issues, Career issues, Life changes, Want growth, Burnout, and 30+ more</p>
          <p><strong>Feelings:</strong> Stressed, Motivated, Anxious, Sad, Excited, Lonely, Frustrated, Hopeful, and 18 more</p>
          <p><strong>What helps:</strong> Rest, Music, Movement, Nature, Being understood, Quiet time, Small wins, and 12 more</p>
        </div>
      </section>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-03</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-03.*</code></p>
        <p>Output: 10 affirmations per batch (JSON array)</p>
        <p>Swipe mechanics: Same iterative feedback loop as FO-02</p>
        <p>Model: openai/gpt-4o-mini (temp 0.9)</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
