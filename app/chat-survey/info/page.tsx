export default function CS01InfoPage() {
  return (
    <div className="max-w-3xl p-6">
      <h2 className="text-2xl font-bold mb-4">About CS-01 (Chat Survey)</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        CS-01 is an AI-powered affirmation generator that uses a conversational
        discovery process to understand your needs before generating personalized
        affirmations. It uses a Tinder-style swipe interface for approving or
        skipping affirmations.
      </p>

      <h3 className="text-lg font-semibold mb-2">How it works</h3>
      <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
        <li>
          <strong>Discovery Phase:</strong> Have a brief conversation with an AI
          agent that asks about your current challenges, goals, and what kind of
          support would help you most.
        </li>
        <li>
          <strong>Profile Building:</strong> The system analyzes your conversation
          to extract themes, challenges, preferred tone, and key insights.
        </li>
        <li>
          <strong>Swipe Phase:</strong> Receive personalized affirmations one at a
          time. Swipe right (or tap the heart) to save, swipe left (or tap X) to
          skip.
        </li>
        <li>
          <strong>Completion:</strong> Once you&apos;ve saved 10 affirmations, view
          your curated collection.
        </li>
      </ol>

      <h3 className="text-lg font-semibold mb-2">Exploration Mode</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        You can skip the discovery conversation and jump straight to swiping
        affirmations. In this mode, the system generates diverse affirmations
        across various themes and learns from your swipe patterns.
      </p>

      <h3 className="text-lg font-semibold mt-6 mb-2">KV Store Configuration</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        CS-01 uses the KV store to configure agent behavior. All prompts and
        instructions are stored as KV entries for easy customization.
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
                cs-01.system_discovery.&#123;impl&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                System prompt for the discovery agent. Defines how the conversational
                interview is conducted.
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                cs-01.system_generation.&#123;impl&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                System prompt for the affirmation generation agent. Defines tone,
                style, and formatting guidelines.
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                cs-01.prompt_extract.&#123;impl&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                Prompt for extracting user profile (themes, challenges, tone, insights)
                from the discovery conversation.
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                cs-01.prompt_generation_explore.&#123;impl&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                Prompt template for generating affirmations in exploration mode
                (no profile available).
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                cs-01.prompt_generation_personalized.&#123;impl&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                Prompt template for generating personalized affirmations based on
                the extracted user profile.
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">
                cs-01._temperature_*.&#123;impl&#125;
              </td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                Temperature settings for different phases (discovery, extraction,
                generation). Higher = more creative.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">Template Variables</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        The generation prompts use Liquid templating with the following variables:
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left p-3 border-b border-gray-200 dark:border-gray-700">Variable</th>
              <th className="text-left p-3 border-b border-gray-200 dark:border-gray-700">Type</th>
              <th className="text-left p-3 border-b border-gray-200 dark:border-gray-700">Description</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 dark:text-gray-400">
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">profile</td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">object</td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                User profile with themes, challenges, tone, insights, and summary
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">approvedAffirmations</td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">array</td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                Affirmations the user has swiped right on (liked)
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">skippedAffirmations</td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">array</td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                Affirmations the user has swiped left on (skipped)
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">allExisting</td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">array</td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                Combined list of all approved + skipped affirmations (to prevent duplicates)
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-mono text-xs">refinementNote</td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">string</td>
              <td className="p-3 border-b border-gray-200 dark:border-gray-700">
                Optional user feedback to guide generation (e.g., &quot;more about confidence&quot;)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">Workflow Architecture</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        CS-01 uses Mastra workflows with suspend/resume for the swipe interaction:
      </p>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap">
{`1. Start workflow
   └── Discovery step (chat with user)
       └── Profile-builder step (extract profile from conversation)
           └── Generate-stream step (loop):
               ├── Generate affirmation
               ├── Suspend workflow, send to client
               ├── Client swipes (approve/skip)
               ├── Resume with action
               └── Repeat until 10 approved
                   └── Return final collection`}
      </pre>

      <h3 className="text-lg font-semibold mt-6 mb-2">Duplicate Prevention</h3>
      <p className="text-gray-600 dark:text-gray-400">
        The system prevents duplicate affirmations through multiple mechanisms:
      </p>
      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-2">
        <li>All existing affirmations are passed to the prompt with explicit &quot;do not repeat&quot; instructions</li>
        <li>Server-side duplicate detection with up to 3 retry attempts</li>
        <li>Client-side double-swipe prevention (debouncing)</li>
      </ul>
    </div>
  );
}
