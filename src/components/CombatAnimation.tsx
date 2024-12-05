import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';

interface CombatAnimationProps {
  isVisible: boolean;
  won: boolean;
  reward?: {
    gold: number;
    xp: number;
  };
}

export function CombatAnimation({ isVisible, won, reward }: CombatAnimationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            className={`p-8 rounded-lg ${won ? 'bg-green-500' : 'bg-red-500'} text-white shadow-lg text-center`}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1, repeat: 0 }}
              className="mb-4"
            >
              <Swords className="w-16 h-16 mx-auto" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold mb-2"
            >
              {won ? 'Zafer!' : 'Yenilgi!'}
            </motion.h2>
            {won && reward && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-1"
              >
                <p className="text-xl">+{reward.gold} 💰</p>
                <p className="text-xl">+{reward.xp} ⭐</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}