import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Coins } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { Player, Property } from '../types/game';
import { calculateItemBonuses } from '../store/utils/itemUtils';

interface RentPaymentDialogProps {
  property: Property;
  owner: Player;
  player: Player;
}

export const RentPaymentDialog = ({ property, owner, player }: RentPaymentDialogProps) => {
  const { kingPosition, settings, payRent } = useGameStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const bonuses = calculateItemBonuses(player);
  
  // Kral bu mülkte mi kontrol et
  const isKingHere = kingPosition === property.id;
  const baseRent = property.rent;
  const kingMultiplier = (isKingHere && settings.kingEnabled) ? 10 : 1;
  const rentAmount = Math.floor(baseRent * kingMultiplier * (1 - bonuses.rentReduction));

  const handlePayRent = async () => {
    if (isProcessing) return;
    
    // Kirayı ödeyecek yeterli parası yoksa
    if (player.coins < rentAmount) {
      // İflas mekanizmasını çağır ve dialog'u kapat
      useGameStore.getState().handleBankruptcy(player.id, rentAmount, owner);
      
      // Dialog'u kapatmak için state'i güncelle
      useGameStore.setState({
        showRentDialog: false,
        rentInfo: null,
        waitingForDecision: false,
        currentPlayerIndex: (useGameStore.getState().currentPlayerIndex + 1) % useGameStore.getState().players.length
      });
      
      return;
    }

    setIsProcessing(true);
    
    try {
      await payRent(player, owner, rentAmount, useGameStore.setState, useGameStore.getState);
      
      // Dialog'u kesinlikle kapat
      useGameStore.setState({
        showRentDialog: false,
        rentInfo: null,
        waitingForDecision: false,
        currentPlayerIndex: (useGameStore.getState().currentPlayerIndex + 1) % useGameStore.getState().players.length
      });
    } catch (error) {
      console.error('Kira ödeme hatası:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Kral pozisyonundaki değişiklikleri izle
  useEffect(() => {
    // Kira miktarını her kral pozisyonu değişiminde güncelle
    const baseRent = property.rent;
    const kingMultiplier = (kingPosition === property.id && settings.kingEnabled) ? 10 : 1;
    const updatedRentAmount = Math.floor(baseRent * kingMultiplier * (1 - bonuses.rentReduction));
    
    // Eğer hesaplanan kira miktarı değişmişse state'i güncelle
    if (updatedRentAmount !== rentAmount) {
      // Zustand'ın setState metodunu kullanarak güncelleyelim
      useGameStore.setState({
        rentInfo: {
          ...useGameStore.getState().rentInfo,
          rentAmount: updatedRentAmount
        }
      });
    }
  }, [kingPosition, settings.kingEnabled, property.id, property.rent, bonuses.rentReduction]);

  const handleOverlayClick = () => {
    // Add your logic here
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center" 
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl w-[90%] max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Kira Ödemesi</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-lg mb-2">
              <span className="font-medium">{player.name}</span>, {' '}
              <span className="font-medium">{owner.name}</span>'nin sahibi olduğu{' '}
              <span className="font-medium">{property.name}</span> mülküne geldiniz.
            </p>
            <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
              <Coins className="w-6 h-6" />
              <span>
                Kira: {rentAmount} 💎
                {isKingHere && settings.kingEnabled && <span className="ml-1 text-yellow-500">(x10)</span>}
              </span>
            </div>
            {bonuses.rentReduction > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                (Item bonusu ile %{Math.round(bonuses.rentReduction * 100)} indirimli)
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Mevcut altınınız: <span className="font-bold">{player.coins}</span>
            </p>
            {player.coins < rentAmount && (
              <p className="text-red-600 mt-1">
                Kirayı ödeyemezseniz iflas edeceksiniz!
              </p>
            )}
          </div>

          <button
            onClick={handlePayRent}
            disabled={isProcessing}
            className={`w-full py-3 rounded-lg transition-colors ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isProcessing ? 'Ödeniyor...' : 'Kirayı Öde'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}