'use client';

interface StepWelcomeProps {
  currentStep: number;
  name: string;
  onNameChange: (name: string) => void;
  onContinue: () => void;
}

/**
 * Welcome steps (0-2) for FO-04 onboarding
 *
 * Step 0 - Welcome intro
 * Step 1 - First name input
 * Step 2 - Personalized welcome
 */
export function StepWelcome({ currentStep, name, onNameChange, onContinue }: StepWelcomeProps) {
  if (currentStep === 0) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
          The way you speak to yourself becomes the way you live!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Today is the day you get unique, personal affirmations.
        </p>
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
          What should we call you?
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
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

  if (currentStep === 2) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <p className="text-xl text-gray-800 dark:text-gray-200 mb-8">
          Welcome, {name}! Let us get to know you so you can get your own unique and personal affirmations.
        </p>
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Start
        </button>
      </div>
    );
  }

  return null;
}
