import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { generateRandomItem } from '../utils/itemGenerator';

export function Market() {
  const [items, setItems] = React.useState(() => Array(6).fill(null).map(() => generateRandomItem()));
  const { players, currentPlayerIndex, equipItem } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  const handlePurchase = (item: ReturnType<typeof generateRandomItem>) => {
    if (currentPlayer.coins >= item.value) {
      equipItem(currentPlayer.id, item);
      setItems(items.map(i => i === item ? generateRandomItem() : i));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full m-4"
      >
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Sihirli Dükkan</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {items.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                item.rarity === 'legendary' ? 'bg-orange-100' :
                item.rarity === 'rare' ? 'bg-blue-100' :
                'bg-gray-100'
              }`}
            >
              <div className="font-medium mb-2">{item.name}</div>
              <div className="text-sm space-y-1 mb-3">
                {item.effects.map((effect, i) => (
                  <div key={i} className="text-gray-600">
                    {effect.rentReduction && `Kira -%${effect.rentReduction * 100}`}
                    {effect.goldMultiplier && `Altın +%${effect.goldMultiplier * 100}`}
                    {effect.expBonus && `Tecrübe +%${effect.expBonus * 100}`}
                  </div>
                ))}
              </div>
              <button
                onClick={() => handlePurchase(item)}
                disabled={currentPlayer.coins < item.value}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                Satın Al ({item.value} 💰)
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => useGameStore.setState({ showMarketDialog: false })}
          className="w-full bg-gray-200 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Kapat
        </button>
      </motion.div>
    </div>
  );
}