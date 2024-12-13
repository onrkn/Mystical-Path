import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  RefreshCw, 
  Coins, 
  Sword, 
  Sparkles, 
  Star, 
  Wand2, 
  BookOpen, 
  Gem, 
  Scroll,
  Shield,
  Shirt,
  Crown
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { generateRandomItem } from '../utils/itemGenerator';
import { getPropertyIcon } from './PropertyIcons';
import { cn } from '../utils/cn';
import { playMagicShopPurchaseSound, MARKET_MUSIC, stopBackgroundMusic, playBackgroundMusic } from '../utils/soundUtils';

export function Market() {
  const [items, setItems] = useState(() => Array(6).fill(null).map(() => generateRandomItem()));
  const { players, currentPlayerIndex, equipItem } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);

  // Market açıldığında müziği başlat ve tema müziğini durdur
  React.useEffect(() => {
    stopBackgroundMusic();
    useGameStore.getState().toggleMarketMusic(true);
    
    return () => {
      useGameStore.getState().toggleMarketMusic(false);
    };
  }, []);

  const handlePurchase = (item: ReturnType<typeof generateRandomItem>) => {
    if (currentPlayer.coins >= item.value && !hasPurchased) {
      playMagicShopPurchaseSound();
      equipItem(currentPlayer.id, item);
      setHasPurchased(true);

      useGameStore.getState().toggleMarketMusic(false);
      playBackgroundMusic();

      useGameStore.setState({ 
        showMarketDialog: false,
        waitingForDecision: false,
        currentPlayerIndex: (currentPlayerIndex + 1) % players.length
      });

      const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
      if (nextPlayer.isBot) {
        setTimeout(() => useGameStore.getState().handleBotTurn(), 1000);
      }
    }
  };

  const refreshItems = () => {
    if (currentPlayer.coins >= 100 && !hasRefreshed && !hasPurchased) {
      currentPlayer.coins -= 100;
      setItems(Array(6).fill(null).map(() => generateRandomItem()));
      setHasRefreshed(true);
      useGameStore.setState({ players: [...players] });
      useGameStore.getState().showNotification({
        title: 'Sihirli Envanter Yenilendi',
        message: 'Gizemli eşyalar ortaya çıktı! (-100 altın)'
      });
    }
  };

  const handleClose = () => {
    useGameStore.setState({ 
      showMarketDialog: false,
      waitingForDecision: false,
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length
    });

    useGameStore.getState().toggleMarketMusic(false);
    playBackgroundMusic();

    const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
    if (nextPlayer.isBot) {
      setTimeout(() => useGameStore.getState().handleBotTurn(), 1000);
    }
  };

  const rarityColors = {
    common: 'bg-gray-100 text-gray-700 border-2 border-gray-300',
    rare: 'bg-blue-50 text-blue-800 border-2 border-blue-300 shadow-blue-100 shadow-md',
    legendary: 'bg-orange-50 text-orange-800 border-2 border-orange-300 shadow-orange-100 shadow-lg'
  };

  const rarityIcons = {
    common: <BookOpen className="w-4 h-4 text-gray-500" />,
    rare: <Star className="w-4 h-4 text-blue-500" />,
    legendary: <Sparkles className="w-4 h-4 text-orange-500" />
  };

  const itemIcons = {
    weapon: () => (
      <div 
        className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
        style={{ backgroundImage: 'url(/src/assets/axe.png)' }}
      />
    ),
    armor: () => (
      <div 
        className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
        style={{ backgroundImage: 'url(/src/assets/armor.png)' }}
      />
    ),
    shield: () => (
      <div 
        className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
        style={{ backgroundImage: 'url(/src/assets/shield.png)' }}
      />
    ),
    helmet: () => (
      <div 
        className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
        style={{ backgroundImage: 'url(/src/assets/helmet.png)' }}
      />
    ),
  };

  const renderPropertyIcon = (propertyName: string) => {
    return getPropertyIcon(propertyName);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-gradient-to-br from-purple-900/70 to-indigo-900/70 flex items-center justify-center overflow-y-auto py-8" 
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 lg:p-8 max-w-5xl w-[95%] mx-auto my-auto overflow-y-auto max-h-[90vh] border-4 border-purple-600/30 shadow-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-4">
            <Wand2 className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-purple-900">Gizemli Sihir Dükkanı</h2>
              <div className="flex items-center gap-2 text-lg lg:text-xl text-yellow-600">
                <Coins className="w-5 h-5" />
                <span>{currentPlayer.name}'ın Altını: {currentPlayer.coins} 💰</span>
              </div>
            </div>
          </div>
          <button
            onClick={refreshItems}
            disabled={currentPlayer.coins < 100 || hasRefreshed || hasPurchased}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            {hasRefreshed ? 'Yenilenmiş' : 'Sihirli Envanter (100 altın)'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Current Inventory */}
          <div className="bg-white/70 rounded-xl p-4 lg:p-6 border-2 border-purple-200 shadow-lg">
            <h3 className="text-xl lg:text-2xl font-semibold mb-4 text-purple-900 flex items-center gap-2">
              <Scroll className="w-6 h-6 text-purple-600" />
              Mevcut Envanter
            </h3>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {['helmet', 'weapon', 'armor', 'shield'].map(slot => {
                const item = currentPlayer.inventory[slot];
                return (
                  <div
                    key={slot}
                    className={cn(
                      'p-3 rounded-lg text-sm transition-all',
                      item ? rarityColors[item.rarity] : 'bg-gray-100 border-2 border-dashed border-gray-300'
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium flex items-center gap-2">
                        {item ? rarityIcons[item.rarity] : null}
                        {item ? itemIcons[item.type]() : null}
                        {item ? item.name : `Boş ${slot}`}
                      </div>
                      {item && <Gem className="w-4 h-4 text-purple-500" />}
                    </div>
                    {item && (
                      <>
                        <div className="text-xs text-gray-600 mb-2">{item.type}</div>
                        <div className="text-xs space-y-1">
                          {item.effects.map((effect, i) => (
                            <div key={i} className="text-gray-700 flex items-center gap-1">
                              <Sword className="w-3 h-3 text-red-500" />
                              {effect.rentReduction && `Kira -%${effect.rentReduction * 100}`}
                              {effect.goldMultiplier && `Altın +%${effect.goldMultiplier * 100}`}
                              {effect.expBonus && `Tecrübe +%${effect.expBonus * 100}`}
                            </div>
                          ))}
                          {(item.rarity === 'legendary' || item.rarity === 'rare') && (
                            <div className="text-gray-700 flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              {item.rarity === 'legendary' ? '+2 STR' : '+1 STR'}
                            </div>
                          )}
                          <div className="mt-1 text-xs font-medium flex items-center gap-1">
                            <Coins className="w-3 h-3 text-yellow-600" />
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
          <div className="bg-white/70 rounded-xl p-4 lg:p-6 border-2 border-purple-200 shadow-lg">
            <h3 className="text-xl lg:text-2xl font-semibold mb-4 text-purple-900 flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-purple-600" />
              Sihirli Eşyalar
            </h3>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'p-3 rounded-lg text-sm cursor-pointer hover:scale-105 transition-all',
                    rarityColors[item.rarity],
                    currentPlayer.coins >= item.value && !hasPurchased ? 'hover:shadow-xl' : 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => handlePurchase(item)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium flex items-center gap-2">
                      {rarityIcons[item.rarity]}
                      {itemIcons[item.type]()}
                      {item.name}
                    </div>
                    <Gem className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{item.type}</div>
                  <div className="text-xs space-y-1">
                    {item.effects.map((effect, i) => (
                      <div key={i} className="text-gray-700 flex items-center gap-1">
                        <Sword className="w-3 h-3 text-red-500" />
                        {effect.rentReduction && `Kira -%${effect.rentReduction * 100}`}
                        {effect.goldMultiplier && `Altın +%${effect.goldMultiplier * 100}`}
                        {effect.expBonus && `Tecrübe +%${effect.expBonus * 100}`}
                      </div>
                    ))}
                    {(item.rarity === 'legendary' || item.rarity === 'rare') && (
                      <div className="text-gray-700 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {item.rarity === 'legendary' ? '+2 STR' : '+1 STR'}
                      </div>
                    )}
                    <div className="mt-1 text-xs font-medium flex items-center gap-1">
                      <Coins className="w-3 h-3 text-yellow-600" />
                      Fiyat: {item.value} 💰
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={handleClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            Dükkanı Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
}