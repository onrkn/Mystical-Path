import type { Player, Property } from '../types/game';
import { useGameStore } from '../store/gameStore';

export function handleBotPropertyUpgrades(bot: Player): void {
  if (!bot.properties.length) return;

  // Get settings from the store
  const settings = useGameStore.getState().settings;

  // Sort properties by potential value (rent/upgrade cost ratio)
  const upgradableProperties = bot.properties
    .filter(p => p.level < 5)
    .sort((a, b) => {
      const aRatio = (a.rent * 1.2) / a.upgradePrice;
      const bRatio = (b.rent * 1.2) / b.upgradePrice;
      return bRatio - aRatio;
    });

  // Calculate minimum reserve based on highest rent on board
  const highestRent = bot.properties.reduce((max, p) => Math.max(max, p.rent), 0);
  const minReserve = Math.max(200, highestRent * 2);

  for (const property of upgradableProperties) {
    // Only upgrade if we have enough coins while maintaining reserve
    if (bot.coins - property.upgradePrice >= minReserve) {
      property.level++;
      bot.coins -= property.upgradePrice;
      bot.propertyUpgrades += property.upgradePrice;
      
      // Calculate new rent with both level bonus and settings multiplier
      const levelBonus = 1 + ((property.level - 1) * 0.2); // 20% increase per level
      property.rent = Math.floor(property.baseRent * levelBonus * settings.propertyRentMultiplier);
      
      property.upgradePrice = Math.floor(property.upgradePrice * 1.5);
    }
  }
}