import React from 'react';
import { motion } from 'framer-motion';
import { Skull, Swords, Shield } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { calculateWinChance } from '../utils/combat';

export function BossBattle() {
  const { players, currentPlayerIndex, activeBoss, fightBoss } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  if (!activeBoss) return null;

  const winChance = calculateWinChance(currentPlayer, activeBoss);
  const winPercentage = Math.round(winChance * 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 max-w-md w-full m-4"
      >
        <div className="text-center">
          <Skull className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">{activeBoss.name}</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <Swords className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-sm font-medium">Güç</div>
              <div className="text-lg">{activeBoss.strength}</div>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-sm font-medium">Kazanma Şansı</div>
              <div className="text-lg">%{winPercentage}</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-yellow-500">💰</div>
              <div className="text-sm font-medium">Ödül</div>
              <div className="text-lg">{activeBoss.rewards.gold}</div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => fightBoss(currentPlayer.id)}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Savaş!
            </button>
            <button
              onClick={() => useGameStore.setState({ showBossDialog: false })}
              className="w-full bg-gray-200 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Kaç
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}