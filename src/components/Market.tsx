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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto py-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-4 lg:p-6 max-w-4xl w-full mx-4 my-auto"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6" />
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">{currentPlayer.name}</h2>
              <div className="flex items-center gap-2 text-lg text-yellow-600">
                <Coins className="w-5 h-5" />
                <span>{currentPlayer.coins} altın</span>
              </div>
            </div>
          </div>
          <button
            onClick={refreshItems}
            disabled={currentPlayer.coins < 100 || hasRefreshed || hasPurchased}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm lg:text-base"
          >
            <RefreshCw className="w-4 h-4" />
            {hasRefreshed ? 'Yenilenmiş' : 'Yenile (100 altın)'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Inventory */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mevcut Envanter</h3>
            <div className="grid grid-cols-2 gap-3">
              {['helmet', 'weapon', 'armor', 'shield'].map(slot => {
                const item = currentPlayer.inventory[slot];
                return (
                  <div
                    key={slot}
                    className={cn(
                      'p-3 rounded-lg text-sm',
                      item ? rarityColors[item.rarity] : 'bg-gray-50 border-2 border-dashed'
                    )}
                  >
                    <div className="font-medium mb-1">
                      {item ? item.name : `Boş ${slot}`}
                    </div>
                    {item && (
                      <>
                        <div className="text-xs text-gray-600 mb-2">{item.type}</div>
                        <div className="text-xs space-y-1">
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
                          <div className="mt-2 text-xs font-medium">
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
            <h3 className="text-lg font-semibold mb-4">Satın Alınabilir Itemler</h3>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    rarityColors[item.rarity]
                  )}
                >
                  <div className="font-medium mb-1">{item.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{item.type}</div>
                  <div className="text-xs space-y-1 mb-3">
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
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-xs"
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
          className="w-full mt-6 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Kapat
        </button>
      </motion.div>
    </div>
  );
}