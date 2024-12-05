import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, AlertTriangle, Gift, Circle, Home, Skull, Trees } from 'lucide-react';
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
  park: 'bg-emerald-100'
};

const squareIcons = {
  normal: Circle,
  market: ShoppingBag,
  sans: Sparkles,
  ceza: AlertTriangle,
  bonus: Gift,
  arsa: Home,
  boss: Skull,
  park: Trees
};

export function BoardSquare({ square, players }: BoardSquareProps) {
  const { players: allPlayers } = useGameStore();
  const Icon = squareIcons[square.type];
  const owner = square.property?.ownerId ? allPlayers.find(p => p.id === square.property?.ownerId) : null;

  return (
    <div 
      className={cn(
        squareColors[square.type],
        'p-2 rounded-lg relative min-h-[80px] flex flex-col items-center justify-center transition-all',
        owner && 'ring-2'
      )}
      style={owner ? { 
        borderColor: owner.color,
        boxShadow: `0 0 0 2px ${owner.color}`
      } : undefined}
    >
      <Icon className="w-6 h-6 mb-1" />
      <div className="text-xs text-center font-medium">{square.name}</div>
      
      {/* Property Level and Rent */}
      {owner && square.property && (
        <div className="absolute top-1 right-1 flex items-center gap-1">
          <div 
            className="text-[10px] font-bold bg-white px-1 rounded shadow-sm"
            title="Mülk Seviyesi"
          >
            Lv.{square.property.level}
          </div>
        </div>
      )}

      {/* Player Tokens */}
      {players.length > 0 && (
        <div className="absolute bottom-1 right-1 flex flex-wrap gap-0.5 max-w-[40px]">
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: player.color }}
              title={player.name}
            />
          ))}
        </div>
      )}

      {/* Property Details */}
      {square.property && (
        <div className="text-[10px] mt-1 text-center">
          {!owner ? (
            <>
              <div>{square.property.price} 💰</div>
            </>
          ) : (
            <div className="text-gray-600">
              Kira: {square.property.rent} 💎
            </div>
          )}
        </div>
      )}
    </div>
  );
}