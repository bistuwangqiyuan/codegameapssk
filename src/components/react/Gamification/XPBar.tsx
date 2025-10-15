/**
 * XP Bar Component
 * Displays user's XP progress within current level
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { calculateLevel } from '@/lib/gamification/xp-calculator';

interface XPBarProps {
  currentXP: number;
  className?: string;
  showDetails?: boolean;
  animated?: boolean;
}

export default function XPBar({
  currentXP,
  className = '',
  showDetails = true,
  animated = true,
}: XPBarProps) {
  const [displayXP, setDisplayXP] = useState(0);
  const levelInfo = calculateLevel(currentXP);

  // Animate XP counter
  useEffect(() => {
    if (!animated) {
      setDisplayXP(currentXP);
      return;
    }

    const duration = 1000; // 1 second
    const steps = 50;
    const increment = currentXP / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(currentXP, current + increment);
      setDisplayXP(Math.floor(current));

      if (step >= steps || current >= currentXP) {
        clearInterval(timer);
        setDisplayXP(currentXP);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentXP, animated]);

  return (
    <div className={`${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-semibold text-gray-700">
            Level {levelInfo.level}: {levelInfo.levelData.title}
          </span>
          <span className="text-gray-600">
            {displayXP.toLocaleString()} / {(levelInfo.levelData.xp_required + levelInfo.levelData.xp_to_next).toLocaleString()} XP
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"></div>
          </motion.div>
        ) : (
          <div
            style={{ width: `${levelInfo.progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
          />
        )}

        {/* Progress percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-lg">
            {Math.round(levelInfo.progress)}%
          </span>
        </div>
      </div>

      {showDetails && levelInfo.xpToNext > 0 && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {levelInfo.xpToNext.toLocaleString()} XP to next level
        </div>
      )}
    </div>
  );
}

