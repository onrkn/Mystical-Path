import React from 'react';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export function DiceRoller() {
  const { rollDice, lastDiceRoll, currentPlayerIndex, players } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const DiceIcon = lastDiceRoll ? DiceIcons[lastDiceRoll - 1] : Dice1;

  if (!currentPlayer) return null;

  if (currentPlayer.isBot) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Bot Sırası: {currentPlayer.name}</h3>
          <p className="text-gray-600">Bot düşünüyor...</p>
        </div>
      </div>
    );
  }

  if (currentPlayer.inJail) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">{currentPlayer.name} Hapishanede!</h3>
          <p className="text-gray-600">Kalan tur: {currentPlayer.jailTurnsLeft}</p>
          <button
            onClick={() => useGameStore.setState({ 
              currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
              isRolling: false,
              waitingForDecision: false
            })}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Sırayı Atla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-2">Sıra: {currentPlayer.name}</h3>
        <div 
          className="w-4 h-4 rounded-full mx-auto"
          style={{ backgroundColor: currentPlayer.color }}
        />
      </div>
      
      <button
        onClick={() => rollDice()}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
      >
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <DiceIcon className="w-8 h-8" />
        </motion.div>
        <span>Zar At</span>
      </button>
    </div>
  );
}