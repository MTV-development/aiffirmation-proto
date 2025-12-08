'use client';

import { useState } from 'react';
import { affirmationThemes } from '@/src/affirmations';

export default function AffirmationsPage() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState('');
  const [affirmations, setAffirmations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTheme = (themeId: string) => {
    setSelectedThemes((prev) =>
      prev.includes(themeId)
        ? prev.filter((id) => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleSubmit = async () => {
    if (selectedThemes.length === 0) return;

    setIsLoading(true);
    setError(null);
    setAffirmations(null);

    try {
      const res = await fetch('/api/affirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themes: selectedThemes.map(
            (id) => affirmationThemes.find((t) => t.id === id)?.label ?? id
          ),
          additionalContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate affirmations');
      }

      setAffirmations(data.affirmations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        What do you want your affirmations to be about?
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {affirmationThemes.map((theme) => (
          <label
            key={theme.id}
            className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedThemes.includes(theme.id)}
              onChange={() => toggleTheme(theme.id)}
              className="w-5 h-5 rounded"
            />
            <div>
              <div className="font-medium">{theme.label}</div>
              <div className="text-xs text-gray-500">{theme.description}</div>
            </div>
          </label>
        ))}
      </div>

      <textarea
        value={additionalContext}
        onChange={(e) => setAdditionalContext(e.target.value)}
        placeholder="Add more details (optional)..."
        className="w-full p-3 border rounded-lg mb-4 min-h-[100px] dark:bg-gray-800 dark:border-gray-600"
      />

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selectedThemes.length === 0 || isLoading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : 'Go'}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {affirmations && (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Your Affirmations</h3>
          <div className="whitespace-pre-wrap leading-relaxed">{affirmations}</div>
        </div>
      )}
    </div>
  );
}
