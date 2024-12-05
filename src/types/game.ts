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
  notification: Notification | null;
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
}

// Rest of the types remain the same...