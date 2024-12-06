import React, { useState } from 'react';
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

export function RentPaymentDialog({ property, owner, player }: RentPaymentDialogProps) {
  const { payRent, kingPosition } = useGameStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const bonuses = calculateItemBonuses(player);
  
  // Kral bu mülkte mi kontrol et
  const isKingHere = kingPosition === property.id;
  const baseRent = property.rent;
  const kingMultiplier = isKingHere ? 10 : 1;
  const rentAmount = Math.floor(baseRent * kingMultiplier * (1 - bonuses.rentReduction));

  const handlePayRent = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    payRent(player, owner, rentAmount);
    // Dialog will be closed by the payRent action
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 max-w-md w-full m-4"
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
                {isKingHere && <span className="ml-1 text-yellow-500">(x10)</span>}
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