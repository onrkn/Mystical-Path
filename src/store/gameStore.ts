import { create } from 'zustand';
import type { GameState } from '../types/game';
import { defaultSettings } from '../config/gameSettings';
import { squares } from '../data/board';
import { handlePropertyActions } from './actions/propertyActions';
import { handleMarketActions } from './actions/marketActions';
import { handleAllianceActions } from './actions/allianceActions';
import { handleBotActions } from './actions/botActions';
import { handleCombatActions } from './actions/combatActions';
import { calculateItemBonuses } from './utils/itemUtils';
import { getBotMarketDecision } from '../utils/botAI';
import { movePlayer } from './utils/movePlayer';
import { handleSquareAction } from './actions/squareActions';
import { generatePlayerColor } from '../utils/playerUtils';

const initialState: GameState = {
  players: [],
  currentPlayerIndex: 0,
  gameStarted: false,
  winner: null,
  lastDiceRoll: null,
  gameMessage: '',
  gameLog: [],
  alliances: [],
  isRolling: false,
  showPropertyDialog: false,
  showBossDialog: false,
  showMarketDialog: false,
  showSettings: false,
  showAllianceDialog: false,
  showRentDialog: false,
  showBankruptcyDialog: false,
  showCombatAnimation: null,
  selectedProperty: null,
  activeBoss: null,
  settings: defaultSettings,
  notification: null,
  waitingForDecision: false,
  isMoving: false,
  rentInfo: null,
  bankruptPlayer: null
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,
  ...handlePropertyActions(set, get),
  ...handleMarketActions(set, get),
  ...handleAllianceActions(set, get),
  ...handleBotActions(set, get),
  ...handleCombatActions(set, get),
  calculateItemBonuses,
  getBotMarketDecision,
  movePlayer: (playerId: string, steps: number) => movePlayer(get, set, playerId, steps),

  rollDice: async () => {
    const { players, currentPlayerIndex, isMoving, waitingForDecision } = get();
    const currentPlayer = players[currentPlayerIndex];

    if (!currentPlayer || isMoving || waitingForDecision || currentPlayer.isBot) {
      return;
    }

    set({ isRolling: true });

    try {
      const roll = Math.floor(Math.random() * 6) + 1;
      set({ lastDiceRoll: roll });
      
      get().addToLog(`<span class="text-gray-500">${currentPlayer.name} ${roll} attı.</span>`);

      await new Promise(resolve => setTimeout(resolve, 1000));
      await get().movePlayer(currentPlayer.id, roll);
    } catch (error) {
      console.error('Error in rollDice:', error);
      set({ 
        currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
        waitingForDecision: false,
        isRolling: false
      });
    }
  },

  showNotification: (notification) => {
    set({ notification });
    setTimeout(() => set({ notification: null }), 3000);
  },

  clearNotification: () => set({ notification: null }),

  addToLog: (message: string) => {
    const { gameLog } = get();
    set({ gameLog: [...gameLog, message] });
  },

  updateSettings: (newSettings) => {
    set({ settings: newSettings });
    
    // Update property prices and rents based on new multipliers
    const { players } = get();
    squares.forEach(square => {
      if (square.property) {
        square.property.price = Math.floor(square.property.baseRent * 5 * newSettings.propertyPriceMultiplier);
        if (!square.property.ownerId) {
          square.property.rent = Math.floor(square.property.baseRent * newSettings.propertyRentMultiplier);
        }
      }
    });

    // Update owned properties
    players.forEach(player => {
      player.properties.forEach(property => {
        property.rent = Math.floor(property.baseRent * (1 + (property.level - 1) * 0.2) * newSettings.propertyRentMultiplier);
      });
    });

    set({ players: [...players] });
  },

  initializeGame: (playerNames: string[], playerTypes: ('human' | 'bot')[]) => {
    const { settings } = get();
    
    // Reset properties to their base state with current settings
    squares.forEach(square => {
      if (square.property) {
        square.property.price = Math.floor(square.property.baseRent * 5 * settings.propertyPriceMultiplier);
        square.property.rent = Math.floor(square.property.baseRent * settings.propertyRentMultiplier);
        square.property.level = 1;
        square.property.ownerId = null;
      }
    });

    const players = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      isBot: playerTypes[index] === 'bot',
      color: generatePlayerColor(index),
      position: 0,
      coins: settings.startingMoney,
      score: 0,
      level: 1,
      xp: 0,
      strength: 1,
      properties: [],
      inventory: {},
      inJail: false,
      jailTurnsLeft: 0,
      allianceId: null,
      startBonusCount: 0,
      rentCollected: 0,
      cardBonuses: 0,
      itemSales: 0,
      propertyPurchases: 0,
      propertyUpgrades: 0,
      rentPaid: 0,
      itemPurchases: 0,
      penalties: 0
    }));

    set({
      players,
      gameStarted: true,
      currentPlayerIndex: 0,
      gameLog: ['Oyun başladı!'],
      waitingForDecision: false,
      isRolling: false
    });

    if (players[0].isBot) {
      setTimeout(() => get().handleBotTurn(), 1500);
    }
  }
}));