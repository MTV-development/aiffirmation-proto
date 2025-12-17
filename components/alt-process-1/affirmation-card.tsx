'use client';

const CARD_COLORS = [
  'bg-[#D4E8DC]', // mint green
  'bg-[#D4DEE8]', // light blue
  'bg-[#E0D8E8]', // lavender
];

interface AffirmationCardProps {
  affirmation: string;
  index: number;
  isSaved: boolean;
  onToggleSave: () => void;
}

export function AffirmationCard({
  affirmation,
  index,
  isSaved,
  onToggleSave,
}: AffirmationCardProps) {
  const colorClass = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <div
      className={`relative p-4 pr-12 rounded-xl ${colorClass} transition-all duration-200`}
    >
      <p className="text-gray-800 text-base leading-relaxed">{affirmation}</p>

      {/* Heart button */}
      <button
        onClick={onToggleSave}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/30 transition-colors"
        aria-label={isSaved ? 'Remove from saved' : 'Save affirmation'}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isSaved ? '#E53E3E' : 'none'}
          stroke={isSaved ? '#E53E3E' : '#4A5568'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isSaved ? 'scale-110' : 'scale-100'}`}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
}
