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
  // Başlangıç gücü (eğer tanımlı değilse 1 olarak başla)
  let strength = player.strength || 1;

  // Mülklerden gelen güç (her mülk +1 güç verir)
  strength += player.properties?.length || 0;

  // Itemlerden gelen güç
  if (player.inventory) {
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
  }

  return strength;
}

export function generatePlayerColor(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}