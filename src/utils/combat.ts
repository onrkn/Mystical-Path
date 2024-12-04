import type { Player, Boss, Item } from '../types/game';

export function calculateWinChance(player: Player, boss: Boss): number {
  // Base chance from player strength vs boss strength
  let chance = (player.strength / (player.strength + boss.strength)) * 0.7;

  // Bonus from equipment
  const equipmentBonus = calculateEquipmentBonus(player);
  chance += equipmentBonus * 0.2;

  // Alliance bonus
  if (player.allianceId) {
    chance += 0.1;
  }

  // Level bonus
  chance += (player.level - 1) * 0.02;

  return Math.min(Math.max(chance, 0.1), 0.9); // Keep between 10% and 90%
}

function calculateEquipmentBonus(player: Player): number {
  let bonus = 0;
  const items = Object.values(player.inventory).filter(Boolean) as Item[];
  
  items.forEach(item => {
    switch (item.rarity) {
      case 'legendary':
        bonus += 0.15;
        break;
      case 'rare':
        bonus += 0.1;
        break;
      case 'common':
        bonus += 0.05;
        break;
    }
  });

  return bonus;
}