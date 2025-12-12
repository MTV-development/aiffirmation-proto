'use client';

interface CollectionSummaryProps {
  /** List of liked affirmations */
  affirmations: string[];
  /** Callback to start over */
  onStartOver: () => void;
}

/**
 * Displays the final collection of liked affirmations with export options
 */
export function CollectionSummary({
  affirmations,
  onStartOver,
}: CollectionSummaryProps) {
  const hasAffirmations = affirmations.length > 0;

  const handleCopyAll = async () => {
    const numberedList = affirmations
      .map((a, i) => `${i + 1}. ${a}`)
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(numberedList);
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = numberedList;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const handleDownload = () => {
    const numberedList = affirmations
      .map((a, i) => `${i + 1}. ${a}`)
      .join('\n\n');
    const blob = new Blob([numberedList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-affirmations.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasAffirmations) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <div className="text-4xl mb-4">📝</div>
        <h2 className="text-2xl font-bold mb-2">Your Collection</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          You didn&apos;t save any affirmations this time.
        </p>
        <button
          onClick={onStartOver}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">✨</div>
        <h2 className="text-2xl font-bold mb-2">Your Collection</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {affirmations.length} affirmation{affirmations.length === 1 ? '' : 's'} saved
        </p>
      </div>

      {/* Numbered affirmation list */}
      <div className="space-y-3 mb-8">
        {affirmations.map((affirmation, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex gap-3"
          >
            <span className="text-gray-400 font-mono shrink-0">{index + 1}.</span>
            <span className="text-gray-800 dark:text-gray-200">{affirmation}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleCopyAll}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy All
        </button>
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download as Text
        </button>
        <button
          onClick={onStartOver}
          className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
