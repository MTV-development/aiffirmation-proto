import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO01InfoPage() {
  return (
    <InfoPageWrapper id="FO-01" name="Full Onboarding" tagline="Complete warm onboarding flow with AI-generated affirmations">
      <InfoSummaryBox>
        A comprehensive 10-step onboarding journey that introduces users to the app while creating
        their personalized affirmation deck. Combines open text intention capture with swipe-based
        selection to curate affirmations that truly resonate.
        <BestFor>Best for new users who want a guided, engaging introduction to affirmation practice.</BestFor>
      </InfoSummaryBox>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Onboarding that creates value, not friction&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          Every step serves dual purposes: welcoming users while building their personalized deck.
        </p>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome &amp; Name</strong> - Personal greeting to establish connection</li>
          <li><strong>Intention Capture</strong> - Open text input (like AP-01) or topic inspiration</li>
          <li><strong>AI Generation</strong> - 100 affirmations created from your intention</li>
          <li><strong>Swipe Selection</strong> - Down to keep, up to discard (10 cards per batch)</li>
          <li><strong>Checkpoints</strong> - Progress markers after each batch</li>
          <li><strong>Personalization</strong> - Background and notification preferences</li>
          <li><strong>Completion</strong> - View your curated affirmation collection</li>
        </ol>
      </InfoSection>

      <InfoSection title="Key Features">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>10-step onboarding journey</strong> - Warm, guided experience from start to finish</li>
          <li><strong>Open text intention capture</strong> - Express yourself freely (AP-01 style)</li>
          <li><strong>Topic inspiration fallback</strong> - &quot;I don&apos;t know&quot; option with helpful prompts</li>
          <li><strong>100 AI-generated affirmations</strong> - Large pool ensures variety</li>
          <li><strong>Swipe-based selection</strong> - Vertical gestures (up/down) for intuitive curation</li>
          <li><strong>Batch processing</strong> - 10 cards at a time prevents overwhelm</li>
          <li><strong>Stunning quality guidelines</strong> - AP-01&apos;s proven affirmation criteria</li>
        </ul>
      </InfoSection>

      {/* Quality Guidelines */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Quality Guidelines</h3>
        <div className="space-y-2 text-blue-700 dark:text-blue-400">
          <p><strong>Structure:</strong> First-person, present-tense, positive framing</p>
          <p><strong>Length:</strong> 5-9 words target (3-14 acceptable)</p>
          <p><strong>Tone:</strong> Calm, grounded, warm, confident but not forceful</p>
          <p><strong>Openers:</strong> Varied (I am, I have, I choose, I trust, My...)</p>
          <p><strong>Avoids:</strong> Superlatives, comparisons, conditionals, toxic positivity</p>
        </div>
      </section>

      {/* Inspiration Sources */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Built From Best Practices</h3>
        <ul className="list-disc list-inside text-emerald-700 dark:text-emerald-400 space-y-1">
          <li><strong>AP-01:</strong> Open intention capture and quality guidelines</li>
          <li><strong>AP-02:</strong> Swipe-based selection mechanics</li>
          <li><strong>FP-01:</strong> Topic inspiration for the &quot;I don&apos;t know&quot; flow</li>
        </ul>
      </section>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-01</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-01.*</code></p>
        <p>Output: 100 affirmations (JSON array)</p>
        <p>Model: google/gemini-2.5-flash (temp 0.9)</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
