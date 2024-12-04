export interface GameSettings {
  startingMoney: number;
  passingStartBonus: number;
  propertyPriceMultiplier: number;
  propertyRentMultiplier: number;
}

export type ItemRarity = 'common' | 'rare' | 'legendary';
export type ItemType = 'helmet' | 'weapon' | 'armor' | 'shield';

export interface ItemEffect {
  rentReduction?: number;
  goldMultiplier?: number;
  expBonus?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  effects: ItemEffect[];
  value: number;
}

export interface Alliance {
  id: string;
  name: string;
  memberIds: string[];
  sharedGold: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  coins: number;
  position: number;
  level: number;
  xp: number;
  strength: number;
  properties: Property[];
  inventory: {
    helmet?: Item;
    weapon?: Item;
    armor?: Item;
    shield?: Item;
  };
  allianceId?: string;
  inJail: boolean;
  jailTurnsLeft: number;
  color: string;
}

export interface Property {
  id: number;
  name: string;
  price: number;
  rent: number;
  level: number;
  upgradePrice: number;
  ownerId: string | null;
  baseRent: number;
}

export interface Boss {
  id: string;
  name: string;
  strength: number;
  rewards: {
    gold: number;
    xp: number;
    item?: Item;
  };
}

export interface Square {
  id: number;
  type: 'normal' | 'market' | 'sans' | 'ceza' | 'bonus' | 'arsa' | 'boss' | 'jail';
  name: string;
  description: string;
  property?: Property;
  effect?: {
    coins?: number;
    score?: number;
    xp?: number;
  };
  boss?: Boss;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gameStarted: boolean;
  winner: Player | null;
  lastDiceRoll: number | null;
  gameMessage: string;
  gameLog: string[];
  alliances: Alliance[];
  isRolling: boolean;
  showPropertyDialog: boolean;
  showBossDialog: boolean;
  showMarketDialog: boolean;
  selectedProperty: Property | null;
  activeBoss: Boss | null;
}

export interface Card {
  id: number;
  type: 'sans' | 'ceza';
  title: string;
  description: string;
  effect: {
    coins?: number;
    score?: number;
    xp?: number;
    moveSteps?: number;
    item?: Item;
  };
}