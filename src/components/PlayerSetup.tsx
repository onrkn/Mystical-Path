import React, { useState } from 'react';
import { UserPlus, Play } from 'lucide-react';

interface PlayerSetupProps {
  onStartGame: (players: string[]) => void;
}

export function PlayerSetup({ onStartGame }: PlayerSetupProps) {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setPlayerNames(Array(count).fill(''));
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerNames.every(name => name.trim())) {
      onStartGame(playerNames);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Player Setup</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Number of Players:
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={playerCount}
            onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
          >
            {[2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Players</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {playerNames.map((name, index) => (
            <div key={index} className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Player ${index + 1} name`}
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
          <span>Start Game</span>
        </button>
      </form>
    </div>
  );
}