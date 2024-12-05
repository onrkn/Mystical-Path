import type { Player } from '../../types/game';

export function calculateItemBonuses(player: Player) {
  let bonuses = {
    rentReduction: 0,
    goldMultiplier: 1,
    expBonus: 0,
  };

  Object.values(player.inventory).forEach(item => {
    if (!item) return;

    item.effects.forEach(effect => {
      if (effect.rentReduction) {
        bonuses.rentReduction += effect.rentReduction;
      }
      if (effect.goldMultiplier) {
        bonuses.goldMultiplier += effect.goldMultiplier;
      }
      if (effect.expBonus) {
        bonuses.expBonus += effect.expBonus;
      }
    });
  });

  return bonuses;
}