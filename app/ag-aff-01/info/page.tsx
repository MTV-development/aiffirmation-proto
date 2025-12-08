export default function AF01InfoPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">About AF-01</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        AF-01 is an AI-powered affirmation generator that creates personalized,
        positive affirmations based on your selected themes and preferences.
      </p>

      <h3 className="text-lg font-semibold mb-2">How it works</h3>
      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
        <li>Select one or more themes that resonate with you</li>
        <li>Optionally add personal context or details</li>
        <li>Click &quot;Go&quot; to generate affirmations</li>
        <li>Use these affirmations in your daily practice</li>
      </ul>

      <h3 className="text-lg font-semibold mt-6 mb-2">Available Themes</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Self-confidence, Anxiety relief, Gratitude, Motivation, Self-love,
        Relationships, Work ethic, Health &amp; wellness, Creativity, and Financial abundance.
      </p>

      <h3 className="text-lg font-semibold mt-6 mb-2">KV Store Configuration</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        AF-01 uses the KV store to configure agent behavior per implementation.
        The implementation dropdown in the top bar selects which configuration to use.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left p-3 border-b border-gray-200 dark:border-gray-700">Key Pattern</th>
              <th className="text-left p-3 border-b border-gray-200 dark:border-gray-700">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 dark:text-gray-400">
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                af-01.system.&#123;implementation&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                System prompt (agent instructions). Defines how the agent behaves,
                how many affirmations to generate, tone, style, etc.
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                af-01.prompt.&#123;implementation&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                User prompt template. The message sent to the agent with user input.
                Falls back to <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">af-01.prompt.default</code> if not found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">Template Variables</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        The prompt template supports mustache-style variable substitution:
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left p-3 border-b border-gray-200 dark:border-gray-700">Variable</th>
              <th className="text-left p-3 border-b border-gray-200 dark:border-gray-700">Description</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 dark:text-gray-400">
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                &#123;&#123;themes&#125;&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                Comma-separated list of selected theme labels
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                &#123;&#123;additionalContext&#125;&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                User-provided additional context text
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                &#123;&#123;#additionalContext&#125;&#125;...&#123;&#123;/additionalContext&#125;&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                Conditional block - content only included if additionalContext is provided
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">Example Prompt Template</h3>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto">
{`Generate affirmations for the following themes: {{themes}}.{{#additionalContext}}

Additional context from user: {{additionalContext}}{{/additionalContext}}`}
      </pre>
    </div>
  );
}
