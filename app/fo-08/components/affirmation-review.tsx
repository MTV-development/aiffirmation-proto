'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

type Rating = 'liked' | 'disliked' | null;

interface AffirmationReviewProps {
  name: string;
  affirmations: string[];
  summary: string;
  onComplete: (likedAffirmations: string[]) => void;
}

/**
 * AffirmationReview component for FO-07
 *
 * Displays 20 affirmations in a scrollable list with Like/Dislike buttons.
 * Users must rate all affirmations before they can continue.
 * On completion, only the liked affirmations are passed to onComplete.
 */
export function AffirmationReview({
  name,
  affirmations,
  summary,
  onComplete,
}: AffirmationReviewProps) {
  const [ratings, setRatings] = useState<Rating[]>(
    () => new Array(affirmations.length).fill(null)
  );

  const allRated = ratings.every((rating) => rating !== null);
  const likedCount = ratings.filter((r) => r === 'liked').length;

  const handleRating = (index: number, rating: Rating) => {
    setRatings((prev) => {
      const newRatings = [...prev];
      // Toggle: if already set to this rating, clear it; otherwise set it
      newRatings[index] = prev[index] === rating ? null : rating;
      return newRatings;
    });
  };

  const handleContinue = () => {
    const likedAffirmations = affirmations.filter(
      (_, index) => ratings[index] === 'liked'
    );
    onComplete(likedAffirmations);
  };

  const ratedCount = ratings.filter((r) => r !== null).length;

  return (
    <motion.div
      className="max-w-md mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Summary section */}
      <motion.div
        className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
          <span>💜</span> Your Journey, {name}
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{summary}</p>
      </motion.div>

      {/* Instructions */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
          Review Your Affirmations
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Rate each affirmation. Thumbs up for ones that resonate with you,
          thumbs down for those that don&apos;t.
        </p>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        className="mb-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {ratedCount} of {affirmations.length} rated
          {likedCount > 0 && ` • ${likedCount} liked`}
        </p>
      </motion.div>

      {/* Affirmation cards list */}
      <motion.div
        className="space-y-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {affirmations.map((affirmation, index) => (
          <AffirmationCard
            key={index}
            affirmation={affirmation}
            index={index}
            rating={ratings[index]}
            onRate={(rating) => handleRating(index, rating)}
          />
        ))}
      </motion.div>

      {/* Continue button at end of list */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleContinue}
          disabled={!allRated}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          {allRated
            ? `Continue with ${likedCount} Affirmation${likedCount !== 1 ? 's' : ''}`
            : `Rate all ${affirmations.length - ratedCount} remaining to continue`}
        </button>
        {!allRated && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            You must rate every affirmation before continuing
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

interface AffirmationCardProps {
  affirmation: string;
  index: number;
  rating: Rating;
  onRate: (rating: Rating) => void;
}

function AffirmationCard({
  affirmation,
  index,
  rating,
  onRate,
}: AffirmationCardProps) {
  const isLiked = rating === 'liked';
  const isDisliked = rating === 'disliked';

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * Math.min(index, 10) }}
    >
      {/* Affirmation number */}
      <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">
        #{index + 1}
      </div>

      {/* Affirmation text */}
      <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
        {affirmation}
      </p>

      {/* Rating buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onRate('liked')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
            isLiked
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label="Like this affirmation"
        >
          <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">Like</span>
        </button>

        <button
          onClick={() => onRate('disliked')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
            isDisliked
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label="Dislike this affirmation"
        >
          <ThumbsDown
            className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`}
          />
          <span className="text-sm">Don&apos;t Like</span>
        </button>
      </div>
    </motion.div>
  );
}
