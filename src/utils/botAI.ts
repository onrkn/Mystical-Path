import type { Player, Square, Item } from '../types/game';
import { squares } from '../data/board';
import { generateRandomItem } from './itemGenerator';

export function getBotDecision(player: Player, square: Square): 'buy' | 'skip' {
  if (square.type !== 'arsa' || !square.property || square.property.ownerId) {
    return 'skip';
  }

  const property = square.property;
  
  // Calculate minimum reserve based on highest rent on board
  const highestRent = squares
    .filter(s => s.property)
    .reduce((max, s) => Math.max(max, s.property?.rent || 0), 0);
  const minReserve = Math.max(200, highestRent * 2);
  
  // Don't buy if it would leave us with less than minimum reserve
  if (player.coins - property.price < minReserve) {
    return 'skip';
  }

  // Always buy if we have more than 3x the property price
  if (player.coins >= property.price * 3) {
    return 'buy';
  }

  // Calculate property value score
  const valueScore = calculatePropertyValue(property, player);
  
  // Buy if the value score is good
  return valueScore > 0.6 ? 'buy' : 'skip';
}

export function getBotMarketDecision(player: Player): Item | null {
  const availableItems = Array(6).fill(null).map(() => generateRandomItem());
  
  // Calculate minimum reserve based on highest rent
  const highestRent = squares
    .filter(s => s.property)
    .reduce((max, s) => Math.max(max, s.property?.rent || 0), 0);
  const minReserve = Math.max(200, highestRent * 2);

  // Don't buy if we would go below minimum reserve
  if (player.coins < minReserve + 100) return null;

  let bestItem: Item | null = null;
  let bestScore = 0;

  // Check what slots are missing
  const missingSlots = ['helmet', 'weapon', 'armor', 'shield'].filter(
    slot => !player.inventory[slot as keyof typeof player.inventory]
  );

  for (const item of availableItems) {
    // Skip if we can't afford it while maintaining reserve
    if (player.coins - item.value < minReserve) continue;

    let score = 0;

    // Prioritize missing slots
    if (missingSlots.includes(item.type)) {
      score += 0.3;
    }

    // Rarity bonus
    switch (item.rarity) {
      case 'legendary':
        score += 0.4;
        break;
      case 'rare':
        score += 0.3;
        break;
      case 'common':
        score += 0.1;
        break;
    }

    // Effect bonuses
    item.effects.forEach(effect => {
      if (effect.goldMultiplier) {
        score += effect.goldMultiplier * 0.5; // Highest priority
      }
      if (effect.rentReduction) {
        score += effect.rentReduction * 0.3;
      }
      if (effect.expBonus) {
        score += effect.expBonus * 0.2;
      }
    });

    // Compare with existing item
    const existingItem = player.inventory[item.type];
    if (existingItem) {
      const existingScore = calculateItemScore(existingItem);
      if (score <= existingScore * 1.2) { // Only upgrade if new item is at least 20% better
        continue;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestScore > 0.5 ? bestItem : null;
}

function calculateItemScore(item: Item): number {
  let score = 0;

  // Base score from rarity
  switch (item.rarity) {
    case 'legendary':
      score += 0.4;
      break;
    case 'rare':
      score += 0.3;
      break;
    case 'common':
      score += 0.1;
      break;
  }

  // Score from effects
  item.effects.forEach(effect => {
    if (effect.goldMultiplier) score += effect.goldMultiplier * 0.5;
    if (effect.rentReduction) score += effect.rentReduction * 0.3;
    if (effect.expBonus) score += effect.expBonus * 0.2;
  });

  return score;
}

function calculatePropertyValue(property: Square['property'], player: Player): number {
  if (!property) return 0;
  
  let score = 0;

  // Base value from rent/price ratio
  score += (property.rent / property.price) * 0.4;

  // Value based on property position
  const propertyIndex = squares.findIndex(s => s.property?.id === property.id);
  const distanceFromStart = Math.min(propertyIndex, squares.length - propertyIndex);
  score += (1 - distanceFromStart / squares.length) * 0.2;

  // Value based on owned neighboring properties
  const neighboringProperties = squares
    .filter(s => s.type === 'arsa' && s.property)
    .filter(s => Math.abs(s.id - propertyIndex) <= 3)
    .map(s => s.property!);

  const ownedNeighbors = neighboringProperties.filter(p => p.ownerId === player.id).length;
  score += (ownedNeighbors / 3) * 0.4;

  return Math.min(Math.max(score, 0), 1);
}