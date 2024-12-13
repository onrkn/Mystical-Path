import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Layers,
  Coins,
  BookOpen,
  Swords,
  ChevronRight,
  Home
} from 'lucide-react';
import type { Item } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { cn } from '../utils/cn';

const itemIcons = {
  helmet: () => (
    <div 
      className="w-8 h-8 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/helmet.png)' }}
    />
  ),
  weapon: () => (
    <div 
      className="w-8 h-8 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/axe.png)' }}
    />
  ),
  armor: () => (
    <div 
      className="w-8 h-8 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/armor.png)' }}
    />
  ),
  shield: () => (
    <div 
      className="w-8 h-8 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/shield.png)' }}
    />
  ),
};

const rarityColors = {
  common: {
    bg: 'bg-gray-100/80 hover:bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-700',
    glow: 'hover:shadow-gray-300/50'
  },
  rare: {
    bg: 'bg-blue-50/80 hover:bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-700',
    glow: 'hover:shadow-blue-300/50'
  },
  legendary: {
    bg: 'bg-orange-50/80 hover:bg-orange-50',
    border: 'border-orange-300',
    text: 'text-orange-700',
    glow: 'hover:shadow-orange-300/50'
  }
};

const rarityIcons = {
  common: <BookOpen className="w-4 h-4 text-gray-500" />,
  rare: <Star className="w-4 h-4 text-blue-500" />,
  legendary: <Sparkles className="w-4 h-4 text-orange-500" />
};

interface InventorySlotProps {
  item?: Item;
  type: keyof typeof itemIcons;
}

const slotLabels = {
  helmet: 'Kask',
  weapon: 'Silah',
  armor: 'Zırh',
  shield: 'Kalkan'
};

function InventorySlot({ item, type }: InventorySlotProps) {
  const Icon = itemIcons[type];
  const rarity = item?.rarity || 'common';
  const colors = rarityColors[rarity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative group p-3 rounded-xl border-2 transition-all duration-300',
        'backdrop-blur-sm shadow-lg hover:shadow-xl cursor-pointer',
        colors.bg,
        colors.border,
        colors.glow
      )}
    >
      {item ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {rarityIcons[item.rarity]}
              <span className={cn('text-sm font-medium', colors.text)}>
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-xs font-medium text-yellow-600">{item.value}</span>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-lg" />
              <Icon />
            </div>
            <div className="flex-1 space-y-1.5">
              {item.effects.map((effect, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-1.5 group"
                >
                  <div className={cn(
                    'p-1 rounded transition-colors',
                    effect.type === 'rentReduction' && 'bg-green-50 group-hover:bg-green-100',
                    effect.type === 'goldMultiplier' && 'bg-yellow-50 group-hover:bg-yellow-100',
                    effect.type === 'expBonus' && 'bg-purple-50 group-hover:bg-purple-100'
                  )}>
                    {effect.type === 'rentReduction' && (
                      <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                    )}
                    {effect.type === 'goldMultiplier' && (
                      <Coins className="w-3.5 h-3.5 text-yellow-500" />
                    )}
                    {effect.type === 'expBonus' && (
                      <Zap className="w-3.5 h-3.5 text-purple-500" />
                    )}
                  </div>
                  <span className="text-xs text-gray-600">
                    {effect.type === 'rentReduction' && `Kira -%${effect.value * 100}`}
                    {effect.type === 'goldMultiplier' && `Altın +%${effect.value * 100}`}
                    {effect.type === 'expBonus' && `Tecrübe +%${effect.value * 100}`}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-3 opacity-60 hover:opacity-80 transition-opacity">
          <Icon />
          <span className="text-xs text-gray-500 mt-2 font-medium">{slotLabels[type]} Slotu</span>
          <span className="text-xs text-gray-400 mt-0.5">Boş</span>
        </div>
      )}
    </motion.div>
  );
}

export function Inventory() {
  const { players, currentPlayerIndex } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border-2 border-purple-100/50 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 bg-contain bg-center bg-no-repeat animate-pulse-subtle"
            style={{ backgroundImage: 'url(/assets/bag.png)' }}
          />
          <div>
            <h3 className="text-lg font-semibold text-purple-900 group flex items-center">
              {currentPlayer.name}'ın Envanteri
              <span className="ml-2 text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                ({Object.values(currentPlayer.inventory).filter(Boolean).length} eşya)
              </span>
            </h3>
            <p className="text-sm text-purple-600/70">Eşyalarını yönet ve güçlen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full flex items-center gap-1">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span>{currentPlayer.coins} altın</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {['helmet', 'weapon', 'armor', 'shield'].map((slot) => {
          const item = currentPlayer.inventory[slot];
          return (
            <motion.div
              key={slot}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'relative p-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02]',
                'border-2',
                item
                  ? cn(
                      rarityColors[item.rarity],
                      'shadow-lg hover:shadow-xl'
                    )
                  : 'bg-gray-50/80 border-gray-200/50 hover:bg-gray-100/90'
              )}
            >
              {item ? (
                <>
                  <div className="absolute top-1.5 right-1.5">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded-full text-xs font-medium',
                      item.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                      item.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    )}>
                      {item.rarity === 'legendary' ? 'Efsanevi' :
                       item.rarity === 'rare' ? 'Nadir' : 'Normal'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="mt-1">
                      {itemIcons[item.type]()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {item.effects.map((effect, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                          {effect.rentReduction && <Home className="w-2.5 h-2.5 text-purple-600" />}
                          {effect.goldMultiplier && <Coins className="w-2.5 h-2.5 text-yellow-600" />}
                          {effect.expBonus && <Star className="w-2.5 h-2.5 text-blue-600" />}
                        </div>
                        <span className="text-gray-600">
                          {effect.rentReduction && `Kira -%${effect.rentReduction * 100}`}
                          {effect.goldMultiplier && `Altın +%${effect.goldMultiplier * 100}`}
                          {effect.expBonus && `Tecrübe +%${effect.expBonus * 100}`}
                        </span>
                      </div>
                    ))}
                    {(item.rarity === 'legendary' || item.rarity === 'rare') && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Swords className="w-2.5 h-2.5 text-yellow-600" />
                        </div>
                        <span className="text-gray-600">
                          {item.rarity === 'legendary' ? '+2 STR' : '+1 STR'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs mt-2 pt-1.5 border-t border-gray-200">
                      <Gem className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-purple-600 font-medium">Değeri: {item.value} altın</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    {itemIcons[slot]()}
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-0.5">{slotLabels[slot]} Slotu</h4>
                  <p className="text-xs text-gray-500">Boş slot. Market'ten ekipman satın alabilirsin.</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}