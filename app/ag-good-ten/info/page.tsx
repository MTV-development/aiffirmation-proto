'use client';

import { useImplementation } from '@/src/ag-good-ten';

export default function GoodTenInfoPage() {
  const { implementation } = useImplementation();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Good Ten - Info</h2>

      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2">About This Agent</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Good Ten is an advanced affirmation generator focused on quality over simplicity.
            It uses detailed criteria to create ten meaningful, well-crafted affirmations
            that are specific, actionable, and psychologically grounded.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Current Implementation</h3>
          <p className="text-gray-600 dark:text-gray-300">
            You are currently using the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{implementation}</code> implementation.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Key Features</h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
            <li>Elaborate criteria for what makes a good affirmation</li>
            <li>Balanced distribution across selected themes</li>
            <li>Natural combinations only when themes genuinely overlap</li>
            <li>Focus on specificity and actionability</li>
            <li>Psychologically grounded language patterns</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Version</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">gt-01</code>
          </p>
        </section>
      </div>
    </div>
  );
}
