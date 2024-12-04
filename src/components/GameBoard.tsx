import React from 'react';
import { BoardSquare } from './BoardSquare';
import { PlayerStats } from './PlayerStats';
import { GameLog } from './GameLog';
import { DiceRoller } from './DiceRoller';
import { Inventory } from './Inventory';
import { squares } from '../data/board';
import { useGameStore } from '../store/gameStore';

export function GameBoard() {
  const { players } = useGameStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        <PlayerStats />
        <Inventory />
        <GameLog />
      </div>
      
      <div className="lg:col-span-2">
        <DiceRoller />
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">Oyun Tahtası</h3>
          <div className="grid grid-cols-8 gap-2">
            {squares.map((square, index) => (
              <BoardSquare
                key={square.id}
                square={square}
                players={players.filter(p => p.position === index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}