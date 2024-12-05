import type { Item, ItemRarity, ItemType, ItemEffect } from '../types/game';

const itemTypes: ItemType[] = ['helmet', 'weapon', 'armor', 'shield'];
const rarityChances = {
  common: 0.7,
  rare: 0.25,
  legendary: 0.05,
};

const effectTypes = ['rentReduction', 'goldMultiplier', 'expBonus'];

const effectsByRarity = {
  common: {
    rentReduction: 0.05,
    goldMultiplier: 0.1,
    expBonus: 0.05,
  },
  rare: {
    rentReduction: 0.1,
    goldMultiplier: 0.2,
    expBonus: 0.1,
  },
  legendary: {
    rentReduction: 0.2,
    goldMultiplier: 0.4,
    expBonus: 0.2,
  },
};

const itemValues = {
  common: 100,
  rare: 250,
  legendary: 500,
};

const prefixes = {
  common: ['Basit', 'Sıradan', 'Normal'],
  rare: ['Büyülü', 'Güçlü', 'Nadir'],
  legendary: ['Efsanevi', 'Kadim', 'Muhteşem'],
};

const itemNames = {
  helmet: ['Miğfer', 'Kask', 'Başlık'],
  weapon: ['Kılıç', 'Balta', 'Topuz'],
  armor: ['Zırh', 'Göğüslük', 'Kalkan'],
  shield: ['Kalkan', 'Siperi', 'Koruyucu'],
};

function generateItemName(type: ItemType, rarity: ItemRarity): string {
  const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
  const name = itemNames[type][Math.floor(Math.random() * itemNames[type].length)];
  return `${prefix} ${name}`;
}

export function generateRandomItem(forcedRarity?: ItemRarity): Item {
  const rarity = forcedRarity || determineRarity();
  const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
  const effects = generateEffects(rarity);

  return {
    id: `item-${Date.now()}-${Math.random()}`,
    name: generateItemName(type, rarity),
    type,
    rarity,
    effects,
    value: itemValues[rarity],
  };
}

function determineRarity(): ItemRarity {
  const roll = Math.random();
  if (roll < rarityChances.legendary) return 'legendary';
  if (roll < rarityChances.legendary + rarityChances.rare) return 'rare';
  return 'common';
}

function generateEffects(rarity: ItemRarity): ItemEffect[] {
  const numEffects = rarity === 'legendary' ? 3 : rarity === 'rare' ? 2 : 1;
  const availableEffects = [...effectTypes];
  const effects: ItemEffect[] = [];

  for (let i = 0; i < numEffects; i++) {
    const effectIndex = Math.floor(Math.random() * availableEffects.length);
    const effectType = availableEffects.splice(effectIndex, 1)[0];
    
    const effect: ItemEffect = {};
    switch (effectType) {
      case 'rentReduction':
        effect.rentReduction = effectsByRarity[rarity].rentReduction;
        break;
      case 'goldMultiplier':
        effect.goldMultiplier = effectsByRarity[rarity].goldMultiplier;
        break;
      case 'expBonus':
        effect.expBonus = effectsByRarity[rarity].expBonus;
        break;
    }
    effects.push(effect);
  }

  return effects;
}

export function generateMarketItems(): Item[] {
  return Array(6).fill(null).map(() => generateRandomItem());
}