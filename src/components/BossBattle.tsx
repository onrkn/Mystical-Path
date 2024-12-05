import React from 'react';
import { motion } from 'framer-motion';
import { Skull, Swords, Shield } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { calculateStrength } from '../utils/playerUtils';

export function BossBattle() {
  const { players, currentPlayerIndex, activeBoss, fightBoss } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  if (!activeBoss) return null;

  const playerStrength = calculateStrength(currentPlayer);
  const winChance = Math.min(Math.max((playerStrength / (playerStrength + activeBoss.strength)) * 100, 10), 90);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 max-w-md w-full m-4"
      >
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Skull className="w-16 h-16 mx-auto mb-4 text-red-500" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-4">{activeBoss.name}</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <Swords className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-sm font-medium">Ejderha Gücü</div>
              <div className="text-lg">{activeBoss.strength}</div>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-sm font-medium">Senin Gücün</div>
              <div className="text-lg">{playerStrength}</div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-yellow-500">💰</div>
              <div className="text-sm font-medium">Kazanma Şansı</div>
              <div className="text-lg">%{Math.round(winChance)}</div>
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
              onClick={() => useGameStore.setState({ 
                showBossDialog: false,
                activeBoss: null,
                waitingForDecision: false,
                currentPlayerIndex: (currentPlayerIndex + 1) % players.length
              })}
              className="w-full bg-gray-200 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Kaç
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {winChance >= 50 ? (
              <p>Kazanma şansınız yüksek! Savaşmayı deneyebilirsiniz.</p>
            ) : (
              <p>Kazanma şansınız düşük! Kaçmayı düşünebilirsiniz.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}