'use client';

interface BottomBarProps {
  onTuneClick: () => void;
  onSavedClick: () => void;
  savedCount: number;
}

export function BottomBar({ onTuneClick, onSavedClick, savedCount }: BottomBarProps) {
  return (
    <div className="flex justify-around items-center py-4 border-t border-gray-800">
      <button
        onClick={onTuneClick}
        className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20v-6M6 20V10M18 20V4" />
        </svg>
        <span className="text-xs">Tune</span>
      </button>

      <button
        onClick={onSavedClick}
        className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors relative"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-xs">Saved</span>
        {savedCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {savedCount > 9 ? '9+' : savedCount}
          </span>
        )}
      </button>
    </div>
  );
}
