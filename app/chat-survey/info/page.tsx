import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function CS01InfoPage() {
  return (
    <InfoPageWrapper id="CS-01" name="Chat Survey" tagline="Two-phase experience: discovery conversation + personalized swipe">
      <InfoSummaryBox>
        The most personalized approach. First, have a natural conversation with an AI that
        asks about your challenges, goals, and what kind of support would help. Then receive
        deeply personalized affirmations based on your unique profile.
        <BestFor>Best for users who want the deepest level of personalization.</BestFor>
      </InfoSummaryBox>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>
            <strong>Discovery Phase</strong> - Have a brief conversation with an AI agent that
            asks about your challenges, goals, and what kind of support would help you most
          </li>
          <li>
            <strong>Profile Building</strong> - The system analyzes your conversation to extract
            themes, challenges, preferred tone, and key insights
          </li>
          <li>
            <strong>Swipe Phase</strong> - Receive personalized affirmations one at a time.
            Swipe right (or tap heart) to save, swipe left (or tap X) to skip
          </li>
          <li>
            <strong>Completion</strong> - Once you&apos;ve saved 10 affirmations, view your curated collection
          </li>
        </ol>
      </InfoSection>

      <InfoSection title="What Makes This Version Unique">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>Conversational discovery</strong> - Natural chat, not a form</li>
          <li><strong>Deep profile extraction</strong> - Understands themes, challenges, tone, and insights</li>
          <li><strong>Highest personalization</strong> - Affirmations tailored to your unique situation</li>
          <li><strong>Exploration mode available</strong> - Can skip conversation and just swipe</li>
        </ul>
      </InfoSection>

      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Exploration Mode</h3>
        <p className="text-blue-700 dark:text-blue-400">
          You can skip the discovery conversation and jump straight to swiping. In this mode,
          the system generates diverse affirmations across various themes and learns from your
          swipe patterns.
        </p>
      </section>

      <InfoSection title="Profile Elements">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span className="font-medium">Themes</span>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Areas of focus identified from your conversation</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span className="font-medium">Challenges</span>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Specific difficulties you mentioned</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span className="font-medium">Tone</span>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Preferred voice inferred from your language</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span className="font-medium">Insights</span>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Key observations about your situation</p>
          </div>
        </div>
      </InfoSection>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">cs-01</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.cs-01.*</code></p>
        <div className="mt-3">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Multi-Agent Architecture</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Discovery Agent - Conducts the conversational interview</li>
            <li>Profile Extractor - Extracts structured profile from conversation</li>
            <li>Generation Agent - Creates personalized affirmations</li>
          </ul>
        </div>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
