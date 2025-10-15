/**
 * Level Up Animation Component
 * Displays celebratory animation when user levels up
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LevelBadge from './LevelBadge';
import type { Level } from '@/types/entities';

interface LevelUpAnimationProps {
  newLevel: number;
  levelData: Level;
  onComplete?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function LevelUpAnimation({
  newLevel,
  levelData,
  onComplete,
  autoClose = true,
  autoCloseDelay = 5000,
}: LevelUpAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onComplete]);

  const handleClose = () => {
    setIsVisible(false);
    onComplete?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="bg-white rounded-3xl p-12 shadow-2xl max-w-md mx-4 text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti Background */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{
                    y: [0, Math.random() * 400 + 100],
                    x: [0, (Math.random() - 0.5) * 200],
                    rotate: [0, Math.random() * 360],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    delay: Math.random() * 0.5,
                  }}
                  className="absolute top-0 left-1/2 w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ['#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981'][Math.floor(Math.random() * 5)],
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                LEVEL UP!
              </motion.h2>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <LevelBadge level={newLevel} size="xl" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-bold text-gray-900 mb-2"
              >
                Level {newLevel}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl text-gray-600 mb-8"
              >
                {levelData.title}
              </motion.p>

              {/* Unlocked Features */}
              {levelData.unlocked_features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6"
                >
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    🎉 New Features Unlocked
                  </h4>
                  <ul className="space-y-2 text-left">
                    {levelData.unlocked_features.map((feature, index) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <span className="text-green-500">✓</span>
                        <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={handleClose}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Continue Learning
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

