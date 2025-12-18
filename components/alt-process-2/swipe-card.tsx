'use client';

import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { useCallback, useEffect } from 'react';
import type { SwipeDirection } from './types';

interface SwipeCardProps {
  text: string;
  onSwipe: (direction: SwipeDirection) => void;
  isTop?: boolean;
  exitDirection?: SwipeDirection | null;
}

const SWIPE_THRESHOLD = 100;

export function SwipeCard({ text, onSwipe, isTop = false, exitDirection }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const controls = useAnimation();

  // When exitDirection changes, animate the card out
  useEffect(() => {
    if (exitDirection) {
      controls.start({
        x: exitDirection === 'right' ? 400 : -400,
        rotate: exitDirection === 'right' ? 15 : -15,
        opacity: 0,
        transition: { duration: 0.25 },
      });
    }
  }, [exitDirection, controls]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
        const direction: SwipeDirection = offset > 0 ? 'right' : 'left';
        onSwipe(direction);
      }
    },
    [onSwipe]
  );

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity,
        zIndex: isTop ? 10 : 0,
      }}
      drag={isTop && !exitDirection ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={controls}
    >
      <div className="w-full h-full rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 p-8 flex items-center justify-center shadow-2xl">
        <p className="text-white text-2xl md:text-3xl font-bold text-center leading-relaxed">
          {text}
        </p>
      </div>
    </motion.div>
  );
}
