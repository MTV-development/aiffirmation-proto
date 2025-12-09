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

        <section>
          <h3 className="text-lg font-semibold mb-2">Model Selection</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            You can customize the AI model by editing the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">_model_name</code> key in the KV store for this implementation.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-1">
            <span className="text-gray-500 dark:text-gray-400">Fast/cheap:</span>{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">openai/gpt-4o-mini</code>,{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">google/gemini-2.5-flash</code>,{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">anthropic/claude-3-haiku</code>
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            <span className="text-gray-500 dark:text-gray-400">Strong:</span>{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">openai/gpt-4o</code>,{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">anthropic/claude-sonnet-4</code>,{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">google/gemini-2.5-pro</code>
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            See <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">openrouter.ai/models</a> for all available models.
          </p>
        </section>
      </div>
    </div>
  );
}
