import React from 'react';
import type { Property } from '../types/game';

interface PropertyDialogProps {
  property: Property;
  playerCoins: number;
  onClose: () => void;
  onPurchase: (purchase: boolean) => void;
}

export function PropertyDialog({ property, playerCoins, onClose, onPurchase }: PropertyDialogProps) {
  const canAfford = playerCoins >= property.price;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{property.name}</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            Bu arsayı satın almak ister misiniz?
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
              onClick={() => onPurchase(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Vazgeç
            </button>
            <button
              onClick={() => onPurchase(true)}
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