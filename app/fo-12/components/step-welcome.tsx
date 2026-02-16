'use client';

interface StepWelcomeProps {
  currentStep: number;
  name: string;
  onNameChange: (name: string) => void;
  onContinue: () => void;
}

/**
 * Welcome steps (0-1) for FO-12 onboarding
 *
 * Step 0 - Welcome intro (new copy)
 * Step 1 - First name input (new copy)
 *
 * FO-12 removes the personalized welcome sub-step that FO-11 had at step 2.
 * Only 2 sub-steps instead of 3.
 */
export function StepWelcome({ currentStep, name, onNameChange, onContinue }: StepWelcomeProps) {
  if (currentStep === 0) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
          Welcome! Let&apos;s get to know you so we can create your personal affirmations.
        </h1>
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="max-w-md mx-auto p-8">
        <h2 className="text-2xl font-medium mb-6 text-center text-gray-800 dark:text-gray-200">
          What&apos;s your name?
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              onContinue();
            }
          }}
          placeholder="Type your first name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 mb-6 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <div className="flex justify-center">
          <button
            onClick={onContinue}
            disabled={!name.trim()}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}
