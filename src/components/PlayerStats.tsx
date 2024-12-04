import React from 'react';
import { Trophy, Coins, Star, Building2 } from 'lucide-react';
import type { Player } from '../types/game';

interface PlayerStatsProps {
  players: Player[];
  currentPlayerIndex: number;
  onUpgradeProperty: (propertyId: number) => void;
}

export function PlayerStats({ players, currentPlayerIndex, onUpgradeProperty }: PlayerStatsProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Oyuncular</h2>
      <div className="space-y-4">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`p-4 rounded-lg ${
              index === currentPlayerIndex
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{player.name}</span>
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
                </div>
              </div>
              
              {player.properties.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold mb-1 flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    Mülkler:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {player.properties.map((property) => (
                      <div
                        key={property.id}
                        className="text-xs p-2 bg-white rounded border"
                      >
                        <div className="flex justify-between">
                          <span>{property.name}</span>
                          <span>Seviye {property.level}</span>
                        </div>
                        {index === currentPlayerIndex && (
                          <button
                            onClick={() => onUpgradeProperty(property.id)}
                            disabled={player.coins < property.upgradePrice}
                            className="mt-1 w-full text-xs py-1 px-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                          >
                            Geliştir ({property.upgradePrice} altın)
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}