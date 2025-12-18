'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TuneSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTone: (tone: 'gentle' | 'strong' | 'change_topic') => void;
}

const tuneOptions = [
  {
    id: 'gentle' as const,
    label: 'Gentler & Calmer',
    description: 'Soft, nurturing affirmations',
  },
  {
    id: 'strong' as const,
    label: 'Stronger & Direct',
    description: 'Assertive, action-oriented affirmations',
  },
  {
    id: 'change_topic' as const,
    label: 'Change Topic entirely',
    description: 'Fresh variety across new themes',
  },
];

export function TuneSheet({ isOpen, onClose, onSelectTone }: TuneSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl z-50 p-6 pb-8"
          >
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6" />

            <h2 className="text-xl font-bold text-white mb-2">How&apos;s The Vibe</h2>
            <p className="text-white/60 text-sm mb-6">
              Too cheerful? Too serious? Help us adjust the stream for you right now.
            </p>

            <div className="space-y-3">
              {tuneOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onSelectTone(option.id);
                    onClose();
                  }}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition-colors"
                >
                  <p className="text-white font-medium">{option.label}</p>
                  <p className="text-white/50 text-sm">{option.description}</p>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 p-3 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
