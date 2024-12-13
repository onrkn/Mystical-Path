import React, { useState, useEffect } from 'react';
import { Trophy, Coins, Star, Building2, TrendingUp, BarChart2, Swords, ChevronDown, ChevronUp } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { PlayerStatsModal } from './PlayerStatsModal';
import { calculateStrength } from '../utils/playerUtils';
import { squares } from '../data/board';
import cn from 'classnames';

export function PlayerStats() {
  const { 
    players, 
    currentPlayerIndex, 
    upgradeProperty, 
    kingPosition,
    weather,
    settings
  } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [propertyRents, setPropertyRents] = useState<{[key: string]: number}>({});
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  useEffect(() => {
    const calculateRent = (property) => {
      // Temel kira hesaplaması (seviye bonusu)
      let rent = property.baseRent * (1 + ((property.level - 1) * 0.2));
      
      // Ayarlar çarpanı
      rent = rent * settings.propertyRentMultiplier;
      
      // Hava durumu etkisi
      if (weather === 'rain' && settings.weatherEnabled) {
        rent = rent * 0.5;
      }
      
      // Kral bonusu kontrolü
      const kingSquare = squares.find(s => s.id === kingPosition);
      const isKingHere = kingSquare?.property?.id === property.id;
      if (isKingHere) {
        rent = rent * 10;
      }
      
      return Math.floor(rent);
    };

    const newRents: {[key: string]: number} = {};
    players.forEach(player => {
      player.properties?.forEach(property => {
        newRents[property.id] = calculateRent(property);
      });
    });
    setPropertyRents(newRents);
  }, [kingPosition, players, weather, settings]);

  useEffect(() => {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer) {
      setExpandedPlayer(currentPlayer.id);
    }
  }, [currentPlayerIndex, players]);

  if (!players || players.length === 0) {
    return null;
  }

  const calculateNextRent = (property) => {
    if (property.level >= 5) return propertyRents[property.id];
    
    // Bir sonraki seviye için hesaplama
    const nextLevelProperty = {...property, level: property.level + 1};
    const calculateRent = (property) => {
      // Temel kira hesaplaması (seviye bonusu)
      let rent = property.baseRent * (1 + ((property.level - 1) * 0.2));
      
      // Ayarlar çarpanı
      rent = rent * settings.propertyRentMultiplier;
      
      // Hava durumu etkisi
      if (weather === 'rain' && settings.weatherEnabled) {
        rent = rent * 0.5;
      }
      
      // Kral bonusu kontrolü
      const kingSquare = squares.find(s => s.id === kingPosition);
      const isKingHere = kingSquare?.property?.id === property.id;
      if (isKingHere) {
        rent = rent * 10;
      }
      
      return Math.floor(rent);
    };
    return calculateRent(nextLevelProperty);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Oyuncular</h2>
        </div>
        <div className="space-y-3">
          {players.map((player, index) => {
            if (player.isBankrupt || player.position === -1) {
              return null;
            }

            const strength = calculateStrength(player);
            const playerProperties = player.properties;

            return (
              <div
                key={player.id}
                className={cn(
                  'p-3 rounded-lg transition-all duration-200 border',
                  index === currentPlayerIndex
                    ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 shadow-sm'
                    : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'
                )}
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: player.color }}
                      >
                        <span className="text-sm font-medium text-white">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{player.name}</span>
                          {index === currentPlayerIndex && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                              •
                            </span>
                          )}
                        </div>
                        <div 
                          onClick={() => setExpandedPlayer(expandedPlayer === player.id ? null : player.id)}
                          className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{playerProperties?.length || 0} mülk</span>
                          {playerProperties?.length > 0 && (
                            expandedPlayer === player.id ? 
                              <ChevronUp className="w-3.5 h-3.5" /> : 
                              <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPlayer(player.id)}
                      className="p-1.5 hover:bg-white/80 rounded transition-colors"
                      title="İstatistikleri Göster"
                    >
                      <BarChart2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 bg-gray-50/50 p-2 rounded-lg">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white/80 hover:bg-white transition-colors border border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">{player.coins}</span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 mt-1">Altın</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white/80 hover:bg-white transition-colors border border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Lv.{player.level}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] font-medium text-gray-400">XP:</span>
                        <span className="text-[10px] font-medium text-blue-500">{player.xp}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white/80 hover:bg-white transition-colors border border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">{strength}</span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 mt-1">STR</span>
                    </div>
                  </div>

                  {expandedPlayer === player.id && playerProperties && playerProperties.length > 0 && (
                    <div className="mt-2 space-y-1.5 animate-fadeIn">
                      {playerProperties.map(property => {
                        const currentRent = propertyRents[property.id];
                        const kingSquare = squares.find(s => s.id === kingPosition);
                        const isKingHere = kingSquare?.property?.id === property.id;
                        const canUpgrade = index === currentPlayerIndex && !player.isBot && property.level < 5;
                        const hasEnoughCoins = player.coins >= property.upgradePrice;

                        return (
                          <div 
                            key={property.id} 
                            className="bg-white/50 p-2 rounded-lg text-sm border border-gray-100 relative group"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">{property.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Seviye {property.level}</span>
                                {canUpgrade && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      upgradeProperty(property.id);
                                    }}
                                    disabled={!hasEnoughCoins}
                                    className={cn(
                                      "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200",
                                      hasEnoughCoins
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    )}
                                    title={hasEnoughCoins ? "Mülkü geliştir" : "Yetersiz altın"}
                                  >
                                    <TrendingUp className="w-3 h-3" />
                                    <span>{property.upgradePrice} 💰</span>
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                              <span>Kira: {currentRent} 💎</span>
                              {weather === 'rain' && settings.weatherEnabled && (
                                <span className="text-blue-500 font-medium">(-50%)</span>
                              )}
                              {isKingHere && (
                                <span className="text-yellow-500 font-bold">(x10)</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
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