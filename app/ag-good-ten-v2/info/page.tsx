'use client';

import { useImplementation } from '@/src/ag-good-ten-v2';

export default function GoodTenV2InfoPage() {
  const { implementation } = useImplementation();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Good Ten v2 - Info</h2>

      <div className="space-y-6">
        <section className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-300">Server Actions Demo</h3>
          <p className="text-green-700 dark:text-green-400">
            This version demonstrates using Mastra agents via Next.js Server Actions.
            The AI generation runs server-side with full access to Mastra features like
            temperature control, tracing, and observability.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">About This Agent</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Good Ten v2 is functionally identical to Good Ten (gt-01) but uses a different
            architecture. Instead of calling OpenRouter directly from the browser, it uses
            a Next.js Server Action that invokes a Mastra agent on the server.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Architecture Comparison</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="font-medium text-gray-700 dark:text-gray-300">gt-01 (Original):</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                Client → Direct OpenRouter API (browser-side)
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded">
              <p className="font-medium text-green-700 dark:text-green-300">gt-02 (This version):</p>
              <p className="text-sm text-green-600 dark:text-green-400 font-mono">
                Client → Server Action → Mastra Agent → OpenRouter (server-side)
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Current Implementation</h3>
          <p className="text-gray-600 dark:text-gray-300">
            You are currently using the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{implementation}</code> implementation.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Benefits of Server Actions</h3>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
            <li><strong>Security:</strong> API key stays on server (not exposed to browser)</li>
            <li><strong>Temperature control:</strong> Configurable via KV store</li>
            <li><strong>Mastra features:</strong> Full access to tracing, memory, tools</li>
            <li><strong>Mastra Studio:</strong> Agent visible in <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">npx mastra dev</code></li>
            <li><strong>Consistency:</strong> Same agent code works in UI and Studio</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Version</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">gt-02</code>
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Configuration</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Configure via KV store keys:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 text-sm">
            <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">versions.gt-02._model_name.default</code> - AI model</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">versions.gt-02._temperature.default</code> - Temperature (0-2)</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">versions.gt-02.system.default</code> - System prompt</li>
            <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">versions.gt-02.prompt.default</code> - User prompt template</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
