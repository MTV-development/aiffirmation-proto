'use client';

interface ProgressBarProps {
  /** Current step or item number (1-indexed) */
  current: number;
  /** Total number of steps or items */
  total: number;
  /** Label to display (e.g., "Step", "Affirmation") */
  label?: string;
  /** Whether to show percentage */
  showPercentage?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable progress bar component for wizard steps and affirmation review
 */
export function ProgressBar({
  current,
  total,
  label = 'Step',
  showPercentage = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {current} of {total}
        </span>
        {showPercentage && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {percentage}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
