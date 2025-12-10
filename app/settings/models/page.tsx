export default function ModelsPage() {
  const fastModels = [
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'OpenAI',
      description: 'Fast, affordable model great for most tasks',
      inputCost: '$0.15',
      outputCost: '$0.60',
    },
    {
      id: 'google/gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'Google',
      description: 'Very fast with large context window (1M tokens)',
      inputCost: '$0.075',
      outputCost: '$0.30',
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      description: 'Fastest Claude model, good for simple tasks',
      inputCost: '$0.25',
      outputCost: '$1.25',
    },
    {
      id: 'meta-llama/llama-3.1-8b-instruct',
      name: 'Llama 3.1 8B',
      provider: 'Meta',
      description: 'Open source, very affordable',
      inputCost: '$0.02',
      outputCost: '$0.05',
    },
  ];

  const strongModels = [
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      description: 'Flagship OpenAI model, excellent all-around',
      inputCost: '$2.50',
      outputCost: '$10.00',
    },
    {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      provider: 'Anthropic',
      description: 'Latest Claude, excellent reasoning and writing',
      inputCost: '$3.00',
      outputCost: '$15.00',
    },
    {
      id: 'google/gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'Google',
      description: 'Strong reasoning with huge context (1M tokens)',
      inputCost: '$1.25',
      outputCost: '$10.00',
    },
    {
      id: 'anthropic/claude-opus-4',
      name: 'Claude Opus 4',
      provider: 'Anthropic',
      description: 'Most capable Claude, best for complex tasks',
      inputCost: '$15.00',
      outputCost: '$75.00',
    },
  ];

  const specializedModels = [
    {
      id: 'openai/o1',
      name: 'o1',
      provider: 'OpenAI',
      description: 'Reasoning model for complex problem-solving',
      inputCost: '$15.00',
      outputCost: '$60.00',
    },
    {
      id: 'openai/o3-mini',
      name: 'o3 Mini',
      provider: 'OpenAI',
      description: 'Faster reasoning model, good cost/performance',
      inputCost: '$1.10',
      outputCost: '$4.40',
    },
    {
      id: 'perplexity/sonar-pro',
      name: 'Sonar Pro',
      provider: 'Perplexity',
      description: 'Web search integrated, great for current info',
      inputCost: '$3.00',
      outputCost: '$15.00',
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">AI Models</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Models available through{' '}
        <a
          href="https://openrouter.ai/models"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          OpenRouter
        </a>
        . Prices are per million tokens.
      </p>

      {/* Fast/Cheap Models */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-green-600">⚡</span> Fast &amp; Affordable
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-medium">Model</th>
                <th className="text-left p-3 font-medium">Provider</th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-right p-3 font-medium">Input</th>
                <th className="text-right p-3 font-medium">Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {fastModels.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {model.id}
                    </code>
                    <div className="text-gray-600 dark:text-gray-400 mt-0.5">{model.name}</div>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{model.provider}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{model.description}</td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">{model.inputCost}</td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">{model.outputCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Strong Models */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-purple-600">💪</span> Strong &amp; Capable
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-medium">Model</th>
                <th className="text-left p-3 font-medium">Provider</th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-right p-3 font-medium">Input</th>
                <th className="text-right p-3 font-medium">Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {strongModels.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {model.id}
                    </code>
                    <div className="text-gray-600 dark:text-gray-400 mt-0.5">{model.name}</div>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{model.provider}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{model.description}</td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">{model.inputCost}</td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">{model.outputCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Specialized Models */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-orange-600">🎯</span> Specialized
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-medium">Model</th>
                <th className="text-left p-3 font-medium">Provider</th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-right p-3 font-medium">Input</th>
                <th className="text-right p-3 font-medium">Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {specializedModels.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {model.id}
                    </code>
                    <div className="text-gray-600 dark:text-gray-400 mt-0.5">{model.name}</div>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{model.provider}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{model.description}</td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">{model.inputCost}</td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">{model.outputCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Usage Instructions */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">How to Use</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          To change the model for an agent, edit the <code className="bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded text-sm">_model_name</code> key
          in the KV store for the desired implementation.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          For example, to use Claude Sonnet 4 for Good Ten, set{' '}
          <code className="bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded text-sm">versions.gt-01._model_name.default</code>{' '}
          to <code className="bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded text-sm">anthropic/claude-sonnet-4</code>.
        </p>
      </section>

      {/* Link to OpenRouter */}
      <div className="mt-6 text-center">
        <a
          href="https://openrouter.ai/models"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          Browse all models on OpenRouter
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
