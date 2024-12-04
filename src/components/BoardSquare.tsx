import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, AlertTriangle, Gift, Circle, Home, Skull, Prison } from 'lucide-react';
import type { Square, Player } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { cn } from '../utils/cn';

interface BoardSquareProps {
  square: Square;
  players: Player[];
}

const squareColors = {
  normal: 'bg-gray-100',
  market: 'bg-blue-100',
  sans: 'bg-purple-100',
  ceza: 'bg-red-100',
  bonus: 'bg-green-100',
  arsa: 'bg-yellow-100',
  boss: 'bg-orange-100',
  jail: 'bg-slate-200'
};

const squareIcons = {
  normal: Circle,
  market: ShoppingBag,
  sans: Sparkles,
  ceza: AlertTriangle,
  bonus: Gift,
  arsa: Home,
  boss: Skull,
  jail: Prison
};

export function BoardSquare({ square, players }: BoardSquareProps) {
  const Icon = squareIcons[square.type];
  const owner = square.property?.ownerId ? players.find(p => p.id === square.property?.ownerId) : null;

  return (
    <div 
      className={cn(
        squareColors[square.type],
        'p-2 rounded-lg relative min-h-[80px] flex flex-col items-center justify-center',
        owner && 'border-2',
        owner && `border-[${owner.color}]`
      )}
    >
      <Icon className="w-6 h-6 mb-1" />
      <div className="text-xs text-center font-medium">{square.name}</div>
      {square.property?.ownerId && (
        <div className="absolute top-1 left-1">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: owner?.color }}
            title={`Sahibi: ${owner?.name}`} 
          />
        </div>
      )}
      {players.length > 0 && (
        <div className="absolute top-0 right-0 p-1 flex flex-col gap-1">
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: player.color }}
              title={player.name}
            />
          ))}
        </div>
      )}
      {square.property && (
        <div className="text-[10px] mt-1">
          {square.property.price} 💰 | {square.property.rent} 💎
        </div>
      )}
    </div>
  );
}