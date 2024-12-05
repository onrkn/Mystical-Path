import React from 'react';
import { useGameStore } from '../store/gameStore';
import type { Property } from '../types/game';

interface PropertyDialogProps {
  property: Property;
}

export function PropertyDialog({ property }: PropertyDialogProps) {
  const { players, currentPlayerIndex, purchaseProperty } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  const canAfford = currentPlayer.coins >= property.price;

  const handlePurchase = (purchase: boolean) => {
    if (purchase && canAfford) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{property.name}</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            {currentPlayer.name}, bu arsayı satın almak ister misin?
          </p>
          <div className="space-y-2">
            <p><strong>Fiyat:</strong> {property.price} altın</p>
            <p><strong>Kira:</strong> {property.rent} altın</p>
            <p><strong>Geliştirme Maliyeti:</strong> {property.upgradePrice} altın</p>
          </div>
          {!canAfford && (
            <p className="text-red-500">
              Bu arsayı almak için yeterli altınınız yok!
            </p>
          )}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => handlePurchase(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Vazgeç
            </button>
            <button
              onClick={() => handlePurchase(true)}
              disabled={!canAfford}
              className={`px-4 py-2 rounded-lg ${
                canAfford
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Satın Al
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}