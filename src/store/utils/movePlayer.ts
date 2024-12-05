import { squares } from '../../data/board';
import type { GetState, SetState } from 'zustand';
import type { GameState } from '../../types/game';
import { calculateItemBonuses } from './itemUtils';
import { handleSquareAction } from '../actions/squareActions';

export async function movePlayer(
  get: GetState<GameState>,
  set: SetState<GameState>,
  playerId: string,
  steps: number
) {
  const { players, settings } = get();
  const player = players.find(p => p.id === playerId);
  if (!player) return;

  set({ isMoving: true });
  const startPosition = player.position;
  let passedStart = false;

  // Animate movement one square at a time
  for (let i = 0; i < Math.abs(steps); i++) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newPosition = (player.position + 1) % squares.length;
    
    // Check if passed start (only when moving forward and haven't passed start yet this move)
    if (!passedStart && newPosition < player.position) {
      passedStart = true;
      const bonuses = calculateItemBonuses(player);
      const startBonus = Math.floor(settings.passingStartBonus * bonuses.goldMultiplier);
      player.coins += startBonus;
      player.startBonusCount++;
      
      get().showNotification({
        title: 'Başlangıç Noktası Bonusu',
        message: `${player.name} başlangıç noktasından geçti! (+${startBonus} altın)`,
        type: 'success'
      });
      get().addToLog(`<span class="text-green-500">${player.name} başlangıç noktasından geçti! (+${startBonus} altın)</span>`);
    }

    player.position = newPosition;
    set({ players: [...players] });
  }

  set({ isMoving: false });

  // Handle square action after movement is complete
  const currentSquare = squares[player.position];
  await handleSquareAction(get, set, playerId, currentSquare);
}