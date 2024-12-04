import React from 'react';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export function DiceRoller() {
  const { rollDice, isRolling, lastDiceRoll, currentPlayerIndex, players } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const DiceIcon = lastDiceRoll ? DiceIcons[lastDiceRoll - 1] : Dice1;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold">Sıra: {currentPlayer?.name}</h3>
        <div 
          className="w-4 h-4 rounded-full mx-auto mt-2"
          style={{ backgroundColor: currentPlayer?.color }}
        />
      </div>
      
      <button
        onClick={() => rollDice()}
        disabled={isRolling}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center"
      >
        <motion.div
          animate={isRolling ? { rotateZ: 360 } : {}}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <DiceIcon className="w-8 h-8" />
        </motion.div>
        <span className="ml-2">Zar At</span>
      </button>
    </div>
  );
}