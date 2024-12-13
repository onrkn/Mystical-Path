import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Crown, 
  CircleOff, 
  Sparkles,
  Star,
  ArrowUpRight,
  Gem,
  Zap,
  Shirt,  
  Layers  
} from 'lucide-react';
import type { Item } from '../types/game';
import { useGameStore } from '../store/gameStore';

const itemIcons = {
  helmet: () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/helmet.png)' }}
    />
  ),
  weapon: () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/axe.png)' }}
    />
  ),
  armor: () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/armor.png)' }}
    />
  ),
  shield: () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/shield.png)' }}
    />
  ),
};

const rarityColors = {
  common: {
    bg: 'bg-gray-100 border-gray-300',
    text: 'text-gray-700',
    glow: 'group-hover:shadow-gray-300'
  },
  rare: {
    bg: 'bg-blue-50 border-blue-300',
    text: 'text-blue-700',
    glow: 'group-hover:shadow-blue-300'
  },
  legendary: {
    bg: 'bg-orange-50 border-orange-300',
    text: 'text-orange-700',
    glow: 'group-hover:shadow-orange-300'
  }
};

interface InventorySlotProps {
  item?: Item;
  type: keyof typeof itemIcons;
}

function InventorySlot({ item, type }: InventorySlotProps) {
  const Icon = itemIcons[type];
  const rarity = item?.rarity || 'common';
  const rarityStyle = rarityColors[rarity];

  return (
    <motion.div 
      className={`
        group relative p-4 rounded-xl border-2 transition-all duration-300 
        ${rarityStyle.bg} ${rarityStyle.text}
        hover:scale-105 hover:shadow-lg ${rarityStyle.glow}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {item && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {rarity === 'legendary' && <Star className="w-4 h-4 text-orange-500" />}
          {rarity === 'rare' && <Sparkles className="w-4 h-4 text-blue-500" />}
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          p-2 rounded-full bg-white shadow-md
          ${item ? 'border-2 ' + (rarityStyle.bg.replace('bg-', 'border-')) : 'border-dashed border-gray-300'}
        `}>
          {Icon()}
        </div>
        <div>
          <h4 className="font-bold text-sm">{item ? item.name : `Boş ${type}`}</h4>
          <p className="text-xs text-gray-500 capitalize">{rarity} {type}</p>
        </div>
      </div>
      
      {item && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Güç Etkileri</span>
            </div>
            <div className="font-semibold">
              {rarity === 'legendary' ? '+2 STR' : rarity === 'rare' ? '+1 STR' : '-'}
            </div>
          </div>
          
          {item.effects.map((effect, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span>
                  {effect.rentReduction && `Kira İndirimi`}
                  {effect.goldMultiplier && `Altın Çarpanı`}
                  {effect.expBonus && `Tecrübe Bonusu`}
                </span>
              </div>
              <div className="font-semibold">
                {effect.rentReduction && `-%${effect.rentReduction * 100}`}
                {effect.goldMultiplier && `+%${effect.goldMultiplier * 100}`}
                {effect.expBonus && `+%${effect.expBonus * 100}`}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!item && (
        <div className="text-center text-gray-400 italic">
          Henüz donatılmamış
        </div>
      )}
    </motion.div>
  );
}

export function Inventory() {
  const { players, currentPlayerIndex } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">{currentPlayer.name}'nin Envanteri</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Gem className="w-5 h-5" />
          <span>{currentPlayer.coins} Altın</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <InventorySlot type="helmet" item={currentPlayer.inventory.helmet} />
        <InventorySlot type="weapon" item={currentPlayer.inventory.weapon} />
        <InventorySlot type="armor" item={currentPlayer.inventory.armor} />
        <InventorySlot type="shield" item={currentPlayer.inventory.shield} />
      </div>
    </motion.div>
  );
}