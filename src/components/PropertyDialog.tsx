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
  const { players, currentPlayerIndex, purchaseProperty, settings } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const canAfford = currentPlayer.coins >= property.price;

  const calculateRentWithMultiplier = () => {
    // Varsayılan çarpan 1 olarak ayarlandı
    const rentMultiplier = settings?.propertyRentMultiplier ?? 1;
    let rent = property.rent * rentMultiplier;
    return Math.floor(rent);
  };

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
      className="fixed inset-0 z-[100] bg-gradient-to-br from-purple-900/70 to-indigo-900/70 flex items-center justify-center p-4" 
      onClick={handleOverlayClick}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-[95%] max-w-2xl p-8 relative border-4 border-purple-600/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500"></div>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="p-3 bg-purple-100 rounded-full">
              {PropertyIcon}
            </div>
            <h2 className="text-4xl font-bold text-gray-800 tracking-tight">{property.name}</h2>
          </div>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="flex items-center space-x-3 bg-yellow-100 px-4 py-2 rounded-full border border-yellow-200"
          >
            <Coins className="w-6 h-6 text-yellow-600" />
            <span className="text-2xl font-semibold text-yellow-800">{currentPlayer.coins} 💰</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Arsa Fiyatı Kartı */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-200/50 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-200/30">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-purple-600" />
                <span className="text-lg font-bold text-purple-900">Arsa Detayları</span>
              </div>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-3xl font-extrabold text-purple-800 flex items-center">
                  {property.price} 
                  <span className="text-base text-purple-500 ml-2">💰</span>
                </p>
                <p className="text-sm text-purple-600 mt-2 opacity-70">Satın Alma Ücreti</p>
              </div>
            </div>
          </motion.div>

          {/* Kira Geliri Kartı */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200/50 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-200/30">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-blue-900">Kira Geliri</span>
              </div>
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-3xl font-extrabold text-blue-800 flex items-center">
                  {calculateRentWithMultiplier()} 
                  <span className="text-base text-blue-500 ml-2">💰</span>
                </p>
                <p className="text-sm text-blue-600 mt-2 opacity-70">Mevcut Kira</p>
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="bg-blue-100/50 rounded-lg px-3 py-2 border border-blue-200/30"
              >
                <div className="text-sm text-blue-600">
                  <span className="opacity-60">Lv.5:</span> 
                  <span className="font-semibold ml-1 text-blue-800">
                    {Math.floor(calculateRentWithMultiplier() * (1 + (4 * 0.2)))} 
                    <span className="text-xs ml-1 opacity-70">💰</span>
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4 bg-green-50 p-5 rounded-xl border border-green-200"
          >
            <ShieldCheck className="w-8 h-8 text-green-600" />
            <p className="text-green-800 text-lg">
              {currentPlayer.name}, bu arsayı satın almak ister misin? Satın alırsan, gelecekte düzenli kira geliri elde edebilirsin.
            </p>
          </motion.div>

          {!canAfford && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 p-5 rounded-xl flex items-center space-x-4"
            >
              <Building2 className="w-8 h-8 text-red-600" />
              <p className="text-red-800 text-lg">
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
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
          >
            Vazgeç
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePurchase(true)}
            disabled={!canAfford}
            className={`px-6 py-3 rounded-xl transition-all ${
              canAfford
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                : 'bg-gray-300 cursor-not-allowed opacity-70'
            }`}
          >
            Satın Al
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}