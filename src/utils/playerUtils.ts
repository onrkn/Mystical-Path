import type { Player } from '../types/game';

const PLAYER_COLORS = [
  '#FF4136', // Bright Red
  '#2ECC40', // Bright Green
  '#0074D9', // Bright Blue
  '#FFDC00', // Bright Yellow
  '#B10DC9', // Purple
  '#FF851B', // Orange
];

export function calculateStrength(player: Player): number {
  let strength = player.strength;

  // Add strength from properties
  strength += player.properties.length;

  // Add strength from items
  Object.values(player.inventory).forEach(item => {
    if (!item) return;
    
    switch (item.rarity) {
      case 'legendary':
        strength += 2;
        break;
      case 'rare':
        strength += 1;
        break;
    }
  });

  return strength;
}

export function generatePlayerColor(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}