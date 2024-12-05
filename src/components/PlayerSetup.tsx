import React, { useState } from 'react';
import { UserPlus, Play, Bot } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function PlayerSetup() {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [playerTypes, setPlayerTypes] = useState<('human' | 'bot')[]>(['human', 'human']);
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
      newNames[index] = `Bot ${index + 1}`;
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
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Oyuncu Ayarları</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Oyuncu Sayısı:
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={playerCount}
            onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
          >
            {[2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Oyuncu</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {playerNames.map((name, index) => (
            <div key={index} className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => togglePlayerType(index)}
                className={`p-2 rounded-md ${
                  playerTypes[index] === 'bot' 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {playerTypes[index] === 'bot' ? <Bot className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </button>
              <input
                type="text"
                placeholder={`${index + 1}. Oyuncu İsmi`}
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="flex-1 p-2 border rounded-md"
                required
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Play className="w-5 h-5" />
          <span>Oyunu Başlat</span>
        </button>
      </form>
    </div>
  );
}