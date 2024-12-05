import React from 'react';
import { X, TrendingUp, TrendingDown, Shield, Coins, Star, Package } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { calculateItemBonuses } from '../store/utils/itemUtils';
import { cn } from '../utils/cn';

interface PlayerStatsModalProps {
  playerId: string;
  onClose: () => void;
}

export function PlayerStatsModal({ playerId, onClose }: PlayerStatsModalProps) {
  const { players, settings } = useGameStore();
  const player = players.find(p => p.id === playerId);

  if (!player) return null;

  const bonuses = calculateItemBonuses(player);

  // Calculate total income and expenses
  const income = {
    startBonus: player.startBonusCount * settings.passingStartBonus,
    propertyRent: player.rentCollected || 0,
    cardBonuses: player.cardBonuses || 0,
    itemSales: player.itemSales || 0,
    total: 0
  };
  income.total = income.startBonus + income.propertyRent + income.cardBonuses + income.itemSales;

  const expenses = {
    propertyPurchases: player.propertyPurchases || 0,
    propertyUpgrades: player.propertyUpgrades || 0,
    rentPaid: player.rentPaid || 0,
    itemPurchases: player.itemPurchases || 0,
    penalties: player.penalties || 0,
    total: 0
  };
  expenses.total = expenses.propertyPurchases + expenses.propertyUpgrades + 
                  expenses.rentPaid + expenses.itemPurchases + expenses.penalties;

  const rarityColors = {
    common: 'text-gray-600',
    rare: 'text-blue-600',
    legendary: 'text-orange-600'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: player.color }}
            />
            {player.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid gap-4">
          {/* Current Items */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Mevcut Itemler
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(player.inventory).map(([slot, item]) => (
                item ? (
                  <div key={slot} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className={cn("font-medium", rarityColors[item.rarity])}>
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">{slot}</div>
                    <div className="text-xs space-y-1">
                      {item.effects.map((effect, i) => (
                        <div key={i} className="text-gray-600">
                          {effect.rentReduction && `Kira -%${effect.rentReduction * 100}`}
                          {effect.goldMultiplier && `Altın +%${effect.goldMultiplier * 100}`}
                          {effect.expBonus && `Tecrübe +%${effect.expBonus * 100}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div key={slot} className="bg-white p-3 rounded-lg shadow-sm border-2 border-dashed border-gray-200">
                    <div className="text-gray-400 font-medium">Boş {slot}</div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Item Bonuses */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Toplam Bonuslar</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2 rounded-lg text-center">
                <Shield className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Kira İndirimi</div>
                <div className="text-lg">%{Math.round(bonuses.rentReduction * 100)}</div>
              </div>
              <div className="bg-white p-2 rounded-lg text-center">
                <Coins className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Altın Çarpanı</div>
                <div className="text-lg">x{bonuses.goldMultiplier.toFixed(1)}</div>
              </div>
              <div className="bg-white p-2 rounded-lg text-center">
                <Star className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-medium">XP Bonusu</div>
                <div className="text-lg">%{Math.round(bonuses.expBonus * 100)}</div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-green-600">
                <TrendingUp className="w-5 h-5" />
                Gelirler
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Başlangıç:</span>
                  <span>{income.startBonus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kiralar:</span>
                  <span>{income.propertyRent}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonuslar:</span>
                  <span>{income.cardBonuses}</span>
                </div>
                <div className="flex justify-between">
                  <span>Satışlar:</span>
                  <span>{income.itemSales}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t">
                  <span>Toplam:</span>
                  <span>{income.total}</span>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-600">
                <TrendingDown className="w-5 h-5" />
                Giderler
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Mülkler:</span>
                  <span>{expenses.propertyPurchases}</span>
                </div>
                <div className="flex justify-between">
                  <span>Geliştirme:</span>
                  <span>{expenses.propertyUpgrades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kiralar:</span>
                  <span>{expenses.rentPaid}</span>
                </div>
                <div className="flex justify-between">
                  <span>Itemler:</span>
                  <span>{expenses.itemPurchases}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t">
                  <span>Toplam:</span>
                  <span>{expenses.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Net Kazanç:</span>
              <span className={cn(
                "text-xl font-bold",
                income.total - expenses.total >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {income.total - expenses.total} 💰
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}