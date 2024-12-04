import type { Item, ItemRarity, ItemType, ItemEffect } from '../types/game';

const itemTypes: ItemType[] = ['helmet', 'weapon', 'armor', 'shield'];
const rarityChances = {
  common: 0.9,
  rare: 0.09,
  legendary: 0.01,
};

const effectsByRarity = {
  common: {
    rentReduction: 0.03,
    goldMultiplier: 0.1,
    expBonus: 0.03,
  },
  rare: {
    rentReduction: 0.05,
    goldMultiplier: 0.25,
    expBonus: 0.05,
  },
  legendary: {
    rentReduction: 0.13,
    goldMultiplier: 0.6,
    expBonus: 0.13,
  },
};

const itemValues = {
  common: 10,
  rare: 50,
  legendary: 150,
};

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
  const effects = [];
  const possibleEffects = Object.keys(effectsByRarity[rarity]) as Array<keyof typeof effectsByRarity[ItemRarity]>;
  const numEffects = rarity === 'legendary' ? 3 : rarity === 'rare' ? 2 : 1;

  for (let i = 0; i < numEffects; i++) {
    const effectType = possibleEffects[Math.floor(Math.random() * possibleEffects.length)];
    effects.push({
      [effectType]: effectsByRarity[rarity][effectType],
    });
  }

  return effects;
}

function generateItemName(type: ItemType, rarity: ItemRarity): string {
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

  const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
  const name = itemNames[type][Math.floor(Math.random() * itemNames[type].length)];

  return `${prefix} ${name}`;
}