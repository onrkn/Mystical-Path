import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sword, Crown, CircleOff } from 'lucide-react';
import type { Item } from '../types/game';
import { useGameStore } from '../store/gameStore';

const itemIcons = {
  helmet: Crown,
  weapon: Sword,
  armor: Shield,
  shield: Shield
};

const rarityColors = {
  common: 'bg-gray-200 text-gray-700',
  rare: 'bg-blue-200 text-blue-700',
  legendary: 'bg-orange-200 text-orange-700'
};

interface InventorySlotProps {
  item?: Item;
  type: keyof typeof itemIcons;
  onEquip?: (item: Item) => void;
}

function InventorySlot({ item, type, onEquip }: InventorySlotProps) {
  const Icon = itemIcons[type];

  return (
    <div className={`p-3 rounded-lg ${item ? rarityColors[item.rarity] : 'bg-gray-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{item ? item.name : `Boş ${type}`}</span>
      </div>
      {item && (
        <div className="text-sm space-y-1">
          {item.effects.map((effect, index) => (
            <div key={index} className="flex items-center gap-1">
              {effect.rentReduction && `Kira -%${effect.rentReduction * 100}`}
              {effect.goldMultiplier && `Altın +%${effect.goldMultiplier * 100}`}
              {effect.expBonus && `Tecrübe +%${effect.expBonus * 100}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Inventory() {
  const { players, currentPlayerIndex } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold mb-4">{currentPlayer.name}'nin Envanteri</h3>
      <div className="grid grid-cols-2 gap-4">
        <InventorySlot type="helmet" item={currentPlayer.inventory.helmet} />
        <InventorySlot type="weapon" item={currentPlayer.inventory.weapon} />
        <InventorySlot type="armor" item={currentPlayer.inventory.armor} />
        <InventorySlot type="shield" item={currentPlayer.inventory.shield} />
      </div>
    </div>
  );
}