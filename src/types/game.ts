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
  isBotTurnInProgress: boolean;
  showPropertyDialog: boolean;
  showBossDialog: boolean;
  showMarketDialog: boolean;
  showSettings: boolean;
  showAllianceDialog: boolean;
  showRentDialog: boolean;
  showBankruptcyDialog: boolean;
  showCombatAnimation: {
    visible: boolean;
    won: boolean;
    reward?: {
      gold: number;
      xp: number;
    };
  } | null;
  selectedProperty: Property | null;
  activeBoss: Boss | null;
  settings: GameSettings;
  notifications: Notification[];
  waitingForDecision: boolean;
  isMoving: boolean;
  rentInfo: {
    property: Property;
    owner: Player;
    player: Player;
  } | null;
  bankruptPlayer: Player | null;
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  color: string;
  position: number;
  coins: number;
  score: number;
  level: number;
  xp: number;
  strength: number;
  dragonKills: number;  // Ejderha öldürme sayacı
  properties: Property[];
  inventory: {
    [key in ItemType]?: Item;
  };
  inJail: boolean;
  jailTurnsLeft: number;
  allianceId: string | null;
  startBonusCount: number;
  rentCollected: number;
  cardBonuses: number;
  itemSales: number;
  propertyPurchases: number;
  propertyUpgrades: number;
  rentPaid: number;
  itemPurchases: number;
  penalties: number;
  isBankrupt?: boolean;
}

export interface Penalty {
  id: string;
  title: string;
  description: string;
  chance: number;
  effect: {
    taxPercentage?: number;
    jailTurns?: number;
    coins?: number;
    moveSteps?: number;
    transferProperty?: boolean;
  };
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
    transferProperty?: boolean;
  };
  chance: number;
}

export interface King {
  id: string;
  name: string;
  position: number;
  movementInterval: number;
}

export type SquareType = 'normal' | 'arsa' | 'sans' | 'ceza' | 'market' | 'park' | 'bonus' | 'boss' | 'slot';

export interface GameSettings {
  startingMoney: number;
  passingStartBonus: number;
  propertyPriceMultiplier: number;
  propertyRentMultiplier: number;
  kingEnabled: boolean;
  dragonBossWinEnabled: boolean; // Ejderha boss kazanma ayarı
}

export type Square = {
  id: number;
  type: SquareType;
  name: string;
  description: string;
  property?: Property;
  effect?: { coins?: number; xp?: number };
  boss?: Boss;
  icon?: React.ReactNode;
};

export interface Boss {
  id: string;
  name: string;
  type: 'dragon' | 'other';
  strength: number;
  rewards: {
    gold: number;
    xp: number;
    item: boolean;
  };
}

// Rest of the types remain the same...