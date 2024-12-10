import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useGameStore 
} from '../store/gameStore';
import type { Property } from '../types/game';
import { playPurchaseSound } from '../utils/soundUtils';
import { 
  Building2, 
  Coins, 
  Star, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { getPropertyIcon } from './PropertyIcons';

export function PropertyDialog({ property }: { property: Property }) {
  const { players, currentPlayerIndex, purchaseProperty } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const canAfford = currentPlayer.coins >= property.price;

  const handlePurchase = (purchase: boolean) => {
    if (purchase && canAfford) {
      playPurchaseSound();
      purchaseProperty(property);
    } else {
      // If not purchasing, clear waiting flag and advance turn
      useGameStore.setState({ 
        showPropertyDialog: false, 
        selectedProperty: null,
        waitingForDecision: false,
        currentPlayerIndex: (currentPlayerIndex + 1) % players.length
      });

      // If next player is bot, trigger bot turn
      const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
      if (nextPlayer.isBot) {
        setTimeout(() => useGameStore.getState().handleBotTurn(), 1000);
      }
    }
  };

  const handleOverlayClick = () => {
    handlePurchase(false);
  };

  const PropertyIcon = getPropertyIcon(property.name);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center" 
      onClick={handleOverlayClick}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-[90%] max-w-xl p-8 relative border-4 border-purple-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {PropertyIcon}
            <h2 className="text-3xl font-bold text-gray-800">{property.name}</h2>
          </div>
          <div className="flex items-center space-x-2 text-yellow-600">
            <Coins className="w-6 h-6" />
            <span className="text-2xl font-semibold">{currentPlayer.coins} 💰</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200/50 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-purple-600 opacity-50"></div>
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-purple-400 to-purple-600 opacity-50 transform rotate-180"></div>
            
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-200/30">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">Arsa Fiyatı</span>
              </div>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-2xl font-bold text-purple-800 flex items-center">
                  {property.price} 
                  <span className="text-sm text-purple-500 ml-1">💰</span>
                </p>
                <p className="text-xs text-purple-600 mt-1 opacity-70">Satın Alma Ücreti</p>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600 opacity-50"></div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200/50 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600 opacity-50"></div>
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600 opacity-50 transform rotate-180"></div>
            
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-200/30">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Kira Geliri</span>
              </div>
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-2xl font-bold text-blue-800 flex items-center">
                  {property.rent} 
                  <span className="text-sm text-blue-500 ml-1">💰</span>
                </p>
                <p className="text-xs text-blue-600 mt-1 opacity-70">Mevcut Kira</p>
              </div>
              
              <div className="bg-blue-100/50 rounded-lg px-2 py-1 border border-blue-200/30">
                <div className="text-xs text-blue-600">
                  <span className="opacity-60">Lv.5:</span> 
                  <span className="font-semibold ml-1 text-blue-800">
                    {Math.floor(property.rent * (1 + (4 * 0.2)))} 
                    <span className="text-[10px] ml-0.5 opacity-70">💰</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 opacity-50"></div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 bg-gray-100 p-4 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-green-600" />
            <p className="text-gray-700">
              {currentPlayer.name}, bu arsayı satın almak ister misin? Satın alırsan, gelecekte kira geliri elde edebilirsin.
            </p>
          </div>

          {!canAfford && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center space-x-3"
            >
              <Building2 className="w-6 h-6 text-red-600" />
              <p className="text-red-700">
                Bu arsayı almak için yeterli altının yok! Daha fazla para kazanman gerekiyor.
              </p>
            </motion.div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePurchase(false)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
          >
            Vazgeç
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePurchase(true)}
            disabled={!canAfford}
            className={`px-6 py-3 rounded-lg transition-all ${
              canAfford
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Satın Al
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}