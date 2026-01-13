import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FullProcessInfoPage() {
  return (
    <InfoPageWrapper id="FP-01" name="Full Process" tagline="Guided 3-step discovery wizard">
      <InfoSummaryBox>
        A guided experience that helps you discover what you need through a 3-step wizard.
        Choose your focus area, identify challenges, and select your preferred tone before
        receiving personalized affirmations in a swipe-card format.
        <BestFor>Best for users who want more guidance in defining their needs.</BestFor>
      </InfoSummaryBox>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Discovery Wizard</strong> - Answer 3 questions about focus, challenges, and tone</li>
          <li><strong>Swipe Review</strong> - Review affirmations one by one, keeping the ones that resonate</li>
          <li><strong>Check-Ins</strong> - Request more affirmations or adjust preferences at milestones</li>
          <li><strong>Export</strong> - Copy or download your curated collection</li>
        </ol>
      </InfoSection>

      <InfoSection title="Discovery Steps">
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-1">Step 1: Primary Focus</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose an area of life: Career Growth, Relationships, Health &amp; Wellness,
              Confidence, Creativity, or Self-Worth. Or enter your own.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-1">Step 2: Challenges (Optional)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select challenges to address: Anxiety, Self-Doubt, Imposter Syndrome,
              Procrastination, Perfectionism, or Burnout.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-1">Step 3: Tone</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose your preferred voice: Gentle &amp; Compassionate, Powerful &amp; Commanding,
              Practical &amp; Grounded, or Spiritual &amp; Reflective.
            </p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="What Makes This Version Unique">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li>Structured discovery process helps you clarify what you need</li>
          <li>Swipe-card interface for one-at-a-time review</li>
          <li>Mid-journey check-ins let you request more or adjust</li>
          <li>Generates 8 affirmations per batch</li>
        </ul>
      </InfoSection>

      <InfoSection title="Tips">
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
          <li>Be specific about your focus area for more personalized results</li>
          <li>Select challenges that truly resonate with your current situation</li>
          <li>Choose a tone that feels comfortable and believable to you</li>
          <li>Like affirmations that feel authentic, skip ones that don&apos;t</li>
        </ul>
      </InfoSection>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fp-01</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fp-01.*</code></p>
        <p>Output: 8 affirmations per batch (JSON array)</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
