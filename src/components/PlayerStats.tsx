import React, { useState } from 'react';
import { Trophy, Coins, Star, Building2, TrendingUp, BarChart2, Swords } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { PlayerStatsModal } from './PlayerStatsModal';
import { calculateStrength } from '../utils/playerUtils';

export function PlayerStats() {
  const { players, currentPlayerIndex, upgradeProperty } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  if (!players || players.length === 0) {
    return null;
  }

  const calculateNextRent = (property) => {
    if (property.level >= 5) return property.rent;
    const nextLevelRent = Math.floor(property.baseRent * (1 + ((property.level + 1) * 0.2)));
    return nextLevelRent;
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Oyuncular</h2>
        <div className="space-y-4">
          {players.map((player, index) => {
            const strength = calculateStrength(player);
            return (
              <div
                key={player.id}
                className={`p-4 rounded-lg ${
                  index === currentPlayerIndex
                    ? 'bg-blue-100 ring-2 ring-blue-500'
                    : 'bg-gray-50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="font-medium">{player.name}</span>
                      <button
                        onClick={() => setSelectedPlayer(player.id)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="İstatistikleri Göster"
                      >
                        <BarChart2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="flex space-x-4">
                      <span className="flex items-center text-yellow-600">
                        <Coins className="w-5 h-5 mr-1" />
                        {player.coins}
                      </span>
                      <span className="flex items-center text-purple-600">
                        <Trophy className="w-5 h-5 mr-1" />
                        {player.score}
                      </span>
                      <span className="flex items-center text-green-600">
                        <Star className="w-5 h-5 mr-1" />
                        {player.level} (XP: {player.xp})
                      </span>
                      <span className="flex items-center text-red-600">
                        <Swords className="w-5 h-5 mr-1" />
                        {strength}
                      </span>
                    </div>
                  </div>
                  
                  {player.properties && player.properties.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold mb-1 flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        Mülkler:
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {player.properties.map((property) => (
                          <div
                            key={property.id}
                            className="text-sm p-3 bg-white rounded border"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{property.name}</span>
                              <span className="text-gray-600">Seviye {property.level}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Mevcut Kira: {property.rent} 💎</span>
                              {property.level < 5 && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  {calculateNextRent(property)} 💎
                                </span>
                              )}
                            </div>
                            {index === currentPlayerIndex && !player.isBot && property.level < 5 && (
                              <button
                                onClick={() => upgradeProperty(property.id)}
                                disabled={player.coins < property.upgradePrice}
                                className="w-full text-xs py-1.5 px-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                              >
                                Geliştir ({property.upgradePrice} 💰)
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPlayer && (
        <PlayerStatsModal 
          playerId={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />
      )}
    </>
  );
}