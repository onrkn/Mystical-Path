import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Play, 
  Bot, 
  Users, 
  Wand2, 
  Sparkles, 
  Crown 
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { generateTurkishBotName } from '../utils/generateBotNames';

export function PlayerSetup() {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '']);
  const [playerTypes, setPlayerTypes] = useState<('human' | 'bot')[]>(['human', 'human', 'human', 'human']);
  const initializeGame = useGameStore(state => state.initializeGame);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setPlayerNames(Array(count).fill(''));
    setPlayerTypes(Array(count).fill('human'));
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const togglePlayerType = (index: number) => {
    const newTypes = [...playerTypes];
    newTypes[index] = newTypes[index] === 'human' ? 'bot' : 'human';
    setPlayerTypes(newTypes);
    
    // If bot, generate a bot name if empty
    if (newTypes[index] === 'bot' && !playerNames[index]) {
      const newNames = [...playerNames];
      newNames[index] = generateTurkishBotName();
      setPlayerNames(newNames);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerNames.every(name => name.trim())) {
      initializeGame(playerNames, playerTypes);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-3">
          <Wand2 className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold text-gray-800">Oyuncu Ayarları</h2>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Users className="w-5 h-5" />
          <span className="font-medium">{playerCount} Oyuncu</span>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Oyuncu Sayısını Seç
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handlePlayerCountChange(num)}
                className={`
                  py-2 rounded-lg transition-all duration-300
                  ${playerCount === num 
                    ? 'bg-purple-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
              >
                {num}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          <div className="space-y-4">
            {playerNames.slice(0, playerCount).map((name, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => togglePlayerType(index)}
                  className={`
                    p-2 rounded-full transition-all duration-300
                    ${playerTypes[index] === 'bot' 
                      ? 'bg-purple-100 text-purple-600 shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  {playerTypes[index] === 'bot' ? <Bot className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                </motion.button>
                
                <input
                  type="text"
                  placeholder={`${index + 1}. Oyuncu İsmi`}
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                  required
                />
                
                {playerTypes[index] === 'bot' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-500 flex items-center space-x-1"
                  >
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span>Bot</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl 
          hover:from-purple-700 hover:to-blue-700 flex items-center justify-center space-x-3 
          transition-all duration-300 shadow-xl hover:shadow-2xl"
        >
          <Play className="w-6 h-6" />
          <span className="text-lg font-semibold">Oyunu Başlat</span>
          <Sparkles className="w-5 h-5 opacity-70" />
        </motion.button>
      </form>
    </motion.div>
  );
}