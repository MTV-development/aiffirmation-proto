import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO10InfoPage() {
  return (
    <InfoPageWrapper id="FO-10" name="Fixed Rails, Dynamic Options" tagline="Predictable journey, personalized choices">
      <InfoSummaryBox>
        An evolution of FO-09 that replaces dynamic AI-generated questions with a fixed 4-question
        sequence. Questions are hardcoded for consistency and quality, while AI-generated chips
        (fragments and sentences) provide contextual personalization. Everything else remains
        identical to FO-09: welcome screens, familiarity, affirmation generation, card review,
        summary, and post-review onboarding.
        <BestFor>Best for users who need a predictable structure with personalized response options.</BestFor>
      </InfoSummaryBox>

      {/* Based on FO-09 */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Based on FO-09</h3>
        <p className="text-amber-700 dark:text-amber-400">
          FO-10 uses FO-09 as its technical base, keeping the card-based curation, unlimited
          generate-more cycles, and two-stage input approach while introducing one key change:
        </p>
        <ul className="list-disc list-inside mt-2 text-amber-700 dark:text-amber-400 space-y-1">
          <li><strong>Fixed question sequence:</strong> 4 hardcoded questions (Goal, Why, Situation, Support tone) instead of AI-generated questions</li>
          <li><strong>Dynamic response options:</strong> AI generates contextual chips/fragments for each question based on user context</li>
          <li><strong>Simpler agent:</strong> Single chip generation agent instead of complex discovery agent with question generation</li>
        </ul>
      </section>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Fixed rails, dynamic options.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          The journey structure is predictable and well-crafted (hardcoded questions),
          while personalization happens in the response options (AI-generated chips). This gives
          users a clear path forward while still adapting to their unique context.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-purple-700 dark:text-purple-400">
                <th className="pb-2 pr-4">Step</th>
                <th className="pb-2 pr-4">Question</th>
                <th className="pb-2">Chip Type</th>
              </tr>
            </thead>
            <tbody className="text-purple-700 dark:text-purple-400">
              <tr>
                <td className="py-1 pr-4">Step 4</td>
                <td className="py-1 pr-4">What is your primary goal?</td>
                <td className="py-1">Predefined flat chips (36 topics)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Step 5</td>
                <td className="py-1 pr-4">Why does this goal feel important?</td>
                <td className="py-1">LLM-generated fragments (ending with &quot;...&quot;)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Step 6</td>
                <td className="py-1 pr-4">In which situation is this important?</td>
                <td className="py-1">LLM-generated complete sentences</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Step 7</td>
                <td className="py-1 pr-4">What kind of support would help?</td>
                <td className="py-1">LLM-generated complete sentences (tone-based)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome</strong> - Warm introduction to set the tone</li>
          <li><strong>Name</strong> - Personal greeting to establish connection</li>
          <li><strong>Welcome Back</strong> - Personalized welcome with name</li>
          <li><strong>Familiarity</strong> - How familiar are you with affirmations?</li>
          <li><strong>Goal (Step 4)</strong> - Fixed question with predefined topic chips (36 flat topics from FO-09)</li>
          <li><strong>Why (Step 5)</strong> - Fixed question with AI-generated hybrid fragments (ending with &quot;...&quot;)</li>
          <li><strong>Situation (Step 6)</strong> - Fixed question with AI-generated complete sentences</li>
          <li><strong>Support Tone (Step 7)</strong> - Fixed question with AI-generated complete sentences about tone/style</li>
          <li><strong>Card Review</strong> - 5 affirmations presented one at a time: &quot;Love it&quot; or &quot;Discard&quot;</li>
          <li><strong>Summary</strong> - See loved affirmations, choose &quot;I&apos;m good with these&quot; or &quot;I want to create more&quot;</li>
          <li><strong>More Cycles</strong> - Generate another batch of 5, repeat until satisfied (unlimited)</li>
          <li><strong>Background</strong> - Visual personalization (mockup)</li>
          <li><strong>Notifications</strong> - Reminder preferences (mockup)</li>
          <li><strong>Paywall</strong> - Premium offering (mockup)</li>
          <li><strong>Completion</strong> - View all loved affirmations across all batches</li>
        </ol>
      </InfoSection>

      {/* Key Differences */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-09</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-09</th>
                <th className="pb-2">FO-10</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Questions</td>
                <td className="py-1 pr-4">AI-generated (dynamic)</td>
                <td className="py-1 font-semibold">Hardcoded (4 fixed questions)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Discovery flow</td>
                <td className="py-1 pr-4">2-5 dynamic screens</td>
                <td className="py-1 font-semibold">Fixed 4 screens (steps 4-7)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Discovery agent</td>
                <td className="py-1 pr-4">Generates questions + fragments</td>
                <td className="py-1 font-semibold">Single chip generation agent (chips only)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Step 4 chips</td>
                <td className="py-1 pr-4">AI-generated sentences</td>
                <td className="py-1 font-semibold">Predefined flat topic chips (same 36 as FO-09 StepTopics)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Steps 5-7 chips</td>
                <td className="py-1 pr-4">AI-generated (mixed modes)</td>
                <td className="py-1 font-semibold">AI-generated: fragments (step 5), sentences (steps 6-7)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">readyForAffirmations</td>
                <td className="py-1 pr-4">AI decides when ready</td>
                <td className="py-1 font-semibold">Not needed — fixed sequence, always proceeds after step 7</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Model</td>
                <td className="py-1 pr-4">gpt-4o-mini (default)</td>
                <td className="py-1 font-semibold">gpt-4o</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Implementations</td>
                <td className="py-1 pr-4">3 (default, two-lanes, bare-bones)</td>
                <td className="py-1 font-semibold">1 (default only)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Affirmation generation</td>
                <td className="py-1 pr-4">Identical</td>
                <td className="py-1">Identical</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Card review / summary</td>
                <td className="py-1 pr-4">Identical</td>
                <td className="py-1">Identical</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Post-review screens</td>
                <td className="py-1 pr-4">Identical</td>
                <td className="py-1">Identical</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Fixed Question Sequence */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">The 4 Fixed Questions</h3>
        <div className="space-y-3 text-blue-700 dark:text-blue-400">
          <div>
            <p className="font-semibold">1. What is your primary goal with affirmations today, [name]?</p>
            <p className="text-sm ml-4 mt-1">→ Predefined flat chips (36 topics: Motivation, Focus, Inner peace, etc.)</p>
            <p className="text-sm ml-4 text-blue-600 dark:text-blue-500 italic">No AI context yet, so chips are predefined</p>
          </div>
          <div>
            <p className="font-semibold">2. Why does this goal feel important to you?</p>
            <p className="text-sm ml-4 mt-1">→ AI-generated hybrid fragments (ending with &quot;...&quot;)</p>
            <p className="text-sm ml-4 text-blue-600 dark:text-blue-500 italic">Example: &quot;I&apos;ve been holding back because...&quot;</p>
          </div>
          <div>
            <p className="font-semibold">3. In which situation is your goal especially important?</p>
            <p className="text-sm ml-4 mt-1">→ AI-generated complete sentences</p>
            <p className="text-sm ml-4 text-blue-600 dark:text-blue-500 italic">Example: &quot;When I need to present ideas in meetings&quot;</p>
          </div>
          <div>
            <p className="font-semibold">4. What kind of support would be most helpful for you right now?</p>
            <p className="text-sm ml-4 mt-1">→ AI-generated complete sentences (tone-based)</p>
            <p className="text-sm ml-4 text-blue-600 dark:text-blue-500 italic">Example: &quot;Bold, empowering statements that push me forward&quot;</p>
          </div>
        </div>
      </section>

      {/* Why Fixed Questions? */}
      <section className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-rose-800 dark:text-rose-300">Why Fixed Questions?</h3>
        <p className="text-rose-700 dark:text-rose-400 mb-2">
          FO-09&apos;s experience showed that AI-generated questions tend to &quot;flounder&quot; regardless of
          prompt engineering — they often lack direction or feel generic.
        </p>
        <p className="text-rose-700 dark:text-rose-400 font-semibold">
          The solution: Take full control of the question sequence (hardcoded) while letting the LLM
          generate contextual response options that adapt to what the user has shared.
        </p>
      </section>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-10-chip-generation</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-10.*</code></p>
        <p>Affirmation count: 5 per batch (unlimited batches)</p>
        <p>Discovery: 4 fixed questions (steps 4-7)</p>
        <p>Question sequence: Goal → Why → Situation → Support tone</p>
        <p>Chip generation: Step-specific user prompt templates</p>
        <p>Selection method: Card-based &quot;Love it&quot; / &quot;Discard&quot;</p>
        <p>Model: openai/gpt-4o</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
