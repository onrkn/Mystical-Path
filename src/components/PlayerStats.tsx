import React, { useState, useEffect } from 'react';
import { Trophy, Coins, Star, Building2, TrendingUp, BarChart2, Swords } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { PlayerStatsModal } from './PlayerStatsModal';
import { calculateStrength } from '../utils/playerUtils';
import { squares } from '../data/board';

export function PlayerStats() {
  const { players, currentPlayerIndex, upgradeProperty, kingPosition } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [propertyRents, setPropertyRents] = useState<{[key: string]: number}>({});

  useEffect(() => {
    // Kral'ın bulunduğu kareyi bul
    const kingSquare = squares.find(s => s.id === kingPosition);
    
    const newRents: {[key: string]: number} = {};
    players.forEach(player => {
      player.properties?.forEach(property => {
        // Temel kirayı hesapla (%20 artış ile)
        const baseRent = property.baseRent * (1 + ((property.level - 1) * 0.2));
        
        // Kral'ın bulunduğu karenin property ID'si ile karşılaştır
        const isKingHere = kingSquare?.property?.id === property.id;
        newRents[property.id] = isKingHere ? baseRent * 10 : baseRent;
      });
    });
    setPropertyRents(newRents);
  }, [kingPosition, players]);

  if (!players || players.length === 0) {
    return null;
  }

  const calculateNextRent = (property) => {
    if (property.level >= 5) return property.baseRent * (1 + ((5 - 1) * 0.2));
    const nextLevelRent = property.baseRent * (1 + (property.level * 0.2));
    return nextLevelRent;
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Oyuncular</h2>
        <div className="space-y-4">
          {players.map((player, index) => {
            const strength = calculateStrength(player);
            const playerProperties = player.properties;

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
                  
                  {playerProperties && playerProperties.length > 0 && (
                    <div className="mt-2">
                      <h3 className="text-sm font-medium mb-2">Mülkler:</h3>
                      <div className="space-y-2">
                        {playerProperties.map(property => {
                          // Kral'ın bulunduğu kareyi bul
                          const kingSquare = squares.find(s => s.id === kingPosition);
                          // Kral'ın bulunduğu karenin property ID'si ile karşılaştır
                          const isKingHere = kingSquare?.property?.id === property.id;
                          const currentRent = propertyRents[property.id] || (property.baseRent * (1 + ((property.level - 1) * 0.2)));

                          return (
                            <div key={property.id} className="bg-white p-2 rounded border text-sm">
                              <div className="flex justify-between items-center">
                                <span>{property.name}</span>
                                <span className="text-gray-500">Seviye {property.level}</span>
                              </div>
                              <div className="text-gray-600">
                                Kira: {Math.floor(property.baseRent * (1 + ((property.level - 1) * 0.2)) * (isKingHere ? 10 : 1))} 💎
                                {isKingHere && (
                                  <span className="ml-1 text-yellow-500 font-bold">(x10)</span>
                                )}
                              </div>
                              {index === currentPlayerIndex && !player.isBot && property.level < 5 && (
                                <button
                                  onClick={() => upgradeProperty(property.id)}
                                  disabled={player.coins < property.upgradePrice}
                                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-2 rounded transition-colors"
                                >
                                  Geliştir ({property.upgradePrice} 💰)
                                </button>
                              )}
                            </div>
                          );
                        })}
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