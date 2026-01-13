'use client';

import { useImplementation } from '@/src/ag-good-ten';
import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function GoodTenInfoPage() {
  const { implementation } = useImplementation();

  return (
    <InfoPageWrapper id="GT-01" name="Good Ten" tagline="Quality-focused generation with detailed criteria">
      <InfoSummaryBox>
        An advanced generator that prioritizes quality over simplicity. Uses detailed psychological
        criteria to create 10 meaningful, well-crafted affirmations that are specific, actionable,
        and grounded in evidence-based principles.
        <BestFor>Best for users who want higher-quality, more thoughtfully crafted affirmations.</BestFor>
      </InfoSummaryBox>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>Select one or more themes (same interface as AF-01)</li>
          <li>Optionally add personal context</li>
          <li>Receive 10 affirmations crafted with detailed quality guidelines</li>
        </ol>
      </InfoSection>

      <InfoSection title="What Makes This Version Unique">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li>Detailed quality criteria for psychologically effective affirmations</li>
          <li>Balanced distribution across selected themes</li>
          <li>Natural theme combinations only (no forced mashups)</li>
          <li>Varied sentence structures and openers for authenticity</li>
          <li>Grounded tone - avoids toxic positivity and overreach</li>
        </ul>
      </InfoSection>

      <InfoSection title="Quality Guidelines">
        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
            <span className="font-medium">Structure:</span> First-person, present-tense, positive framing
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
            <span className="font-medium">Length:</span> 5-9 words target (3-14 acceptable)
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
            <span className="font-medium">Tone:</span> Calm, grounded, warm, confident but not forceful
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
            <span className="font-medium">Avoids:</span> Superlatives, comparisons, conditionals, external dependency
          </div>
        </div>
      </InfoSection>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">gt-01</code></p>
        <p>Current implementation: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{implementation}</code></p>
        <p>Output: 10 affirmations (numbered list)</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
