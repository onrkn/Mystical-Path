import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, RefreshCw, Coins, Sword } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { generateRandomItem } from '../utils/itemGenerator';
import { cn } from '../utils/cn';

export function Market() {
  const [items, setItems] = useState(() => Array(6).fill(null).map(() => generateRandomItem()));
  const { players, currentPlayerIndex, equipItem } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  const handlePurchase = (item: ReturnType<typeof generateRandomItem>) => {
    if (currentPlayer.coins >= item.value && !hasPurchased) {
      equipItem(currentPlayer.id, item);
      setHasPurchased(true);
    }
  };

  const refreshItems = () => {
    if (currentPlayer.coins >= 100 && !hasRefreshed && !hasPurchased) {
      currentPlayer.coins -= 100;
      setItems(Array(6).fill(null).map(() => generateRandomItem()));
      setHasRefreshed(true);
      useGameStore.setState({ players: [...players] });
      useGameStore.getState().showNotification({
        title: 'Market Yenilendi',
        message: 'Yeni itemler geldi! (-100 altın)'
      });
    }
  };

  const handleClose = () => {
    useGameStore.setState({ 
      showMarketDialog: false,
      waitingForDecision: false,
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length
    });

    // If next player is bot, trigger bot turn
    const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
    if (nextPlayer.isBot) {
      setTimeout(() => useGameStore.getState().handleBotTurn(), 1000);
    }
  };

  const rarityColors = {
    common: 'bg-gray-100 text-gray-700',
    rare: 'bg-blue-100 text-blue-700',
    legendary: 'bg-orange-100 text-orange-700'
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto py-8" 
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-4 lg:p-6 max-w-4xl w-[95%] mx-auto my-auto overflow-y-auto max-h-[90vh]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 lg:mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" />
            <div>
              <h2 className="text-lg lg:text-2xl font-bold">{currentPlayer.name}</h2>
              <div className="flex items-center gap-1 lg:gap-2 text-sm lg:text-lg text-yellow-600">
                <Coins className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>{currentPlayer.coins} altın</span>
              </div>
            </div>
          </div>
          <button
            onClick={refreshItems}
            disabled={currentPlayer.coins < 100 || hasRefreshed || hasPurchased}
            className="flex items-center gap-1 lg:gap-2 px-2 py-1 lg:px-4 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-xs lg:text-base"
          >
            <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4" />
            {hasRefreshed ? 'Yenilenmiş' : 'Yenile (100 altın)'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Current Inventory */}
          <div>
            <h3 className="text-base lg:text-lg font-semibold mb-2 lg:mb-4">Mevcut Envanter</h3>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {['helmet', 'weapon', 'armor', 'shield'].map(slot => {
                const item = currentPlayer.inventory[slot];
                return (
                  <div
                    key={slot}
                    className={cn(
                      'p-2 lg:p-3 rounded-lg text-xs lg:text-sm',
                      item ? rarityColors[item.rarity] : 'bg-gray-50 border-2 border-dashed'
                    )}
                  >
                    <div className="font-medium mb-1">
                      {item ? item.name : `Boş ${slot}`}
                    </div>
                    {item && (
                      <>
                        <div className="text-[10px] lg:text-xs text-gray-600 mb-1 lg:mb-2">{item.type}</div>
                        <div className="text-[10px] lg:text-xs space-y-1">
                          {item.effects.map((effect, i) => (
                            <div key={i} className="text-gray-600">
                              {effect.rentReduction && `Kira -%${effect.rentReduction * 100}`}
                              {effect.goldMultiplier && `Altın +%${effect.goldMultiplier * 100}`}
                              {effect.expBonus && `Tecrübe +%${effect.expBonus * 100}`}
                            </div>
                          ))}
                          {(item.rarity === 'legendary' || item.rarity === 'rare') && (
                            <div className="text-gray-600 flex items-center gap-1">
                              <Sword className="w-3 h-3 text-red-500" />
                              {item.rarity === 'legendary' ? '+2 STR' : '+1 STR'}
                            </div>
                          )}
                          <div className="mt-1 text-[10px] lg:text-xs font-medium">
                            Değeri: {item.value} 💰
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Items */}
          <div>
            <h3 className="text-base lg:text-lg font-semibold mb-2 lg:mb-4">Satın Alınabilir Itemler</h3>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-2 lg:p-3 rounded-lg text-xs lg:text-sm',
                    rarityColors[item.rarity]
                  )}
                >
                  <div className="font-medium mb-1">{item.name}</div>
                  <div className="text-[10px] lg:text-xs text-gray-600 mb-1 lg:mb-2">{item.type}</div>
                  <div className="text-[10px] lg:text-xs space-y-1 mb-2 lg:mb-3">
                    {item.effects.map((effect, i) => (
                      <div key={i} className="text-gray-600">
                        {effect.rentReduction && `Kira -%${effect.rentReduction * 100}`}
                        {effect.goldMultiplier && `Altın +%${effect.goldMultiplier * 100}`}
                        {effect.expBonus && `Tecrübe +%${effect.expBonus * 100}`}
                      </div>
                    ))}
                    {(item.rarity === 'legendary' || item.rarity === 'rare') && (
                      <div className="text-gray-600 flex items-center gap-1">
                        <Sword className="w-3 h-3 text-red-500" />
                        {item.rarity === 'legendary' ? '+2 STR' : '+1 STR'}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={currentPlayer.coins < item.value || hasPurchased}
                    className="w-full bg-blue-600 text-white py-1 lg:py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-[10px] lg:text-xs"
                  >
                    {hasPurchased ? 'Zaten Satın Aldın' : `Satın Al (${item.value} 💰)`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="w-full mt-4 lg:mt-6 bg-gray-200 py-2 lg:py-3 rounded-lg hover:bg-gray-300 transition-colors text-sm lg:text-base"
        >
          Kapat
        </button>
      </motion.div>
    </div>
  );
}