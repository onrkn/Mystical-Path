import { create } from 'zustand';
import type { GameState, Player, Property, Alliance, Item } from '../types/game';
import { generateRandomItem } from '../utils/itemGenerator';
import { calculateWinChance } from '../utils/combat';

interface GameStore extends GameState {
  initializeGame: (players: string[]) => void;
  rollDice: () => Promise<void>;
  purchaseProperty: (property: Property) => void;
  upgradeProperty: (propertyId: number) => void;
  createAlliance: (name: string, playerIds: string[]) => void;
  equipItem: (playerId: string, item: Item) => void;
  fightBoss: (playerId: string) => void;
  movePlayer: (playerId: string, steps: number) => Promise<void>;
  addToLog: (message: string) => void;
}

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
  selectedProperty: null,
  activeBoss: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  initializeGame: (playerNames) => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      score: 0,
      coins: 200,
      position: 0,
      level: 1,
      xp: 0,
      strength: 1,
      properties: [],
      inventory: {},
      inJail: false,
      jailTurnsLeft: 0,
      color: `hsl(${(360 / playerNames.length) * index}, 70%, 50%)`,
    }));

    set({ players, gameStarted: true });
  },

  rollDice: async () => {
    set({ isRolling: true });
    
    const result = Math.floor(Math.random() * 6) + 1;
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { players, currentPlayerIndex } = get();
    const currentPlayer = players[currentPlayerIndex];
    
    if (currentPlayer.inJail) {
      if (currentPlayer.jailTurnsLeft > 0) {
        currentPlayer.jailTurnsLeft--;
        set({
          players,
          isRolling: false,
          currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
          lastDiceRoll: result,
          gameMessage: `${currentPlayer.name} hapishanede. Kalan tur: ${currentPlayer.jailTurnsLeft}`,
        });
        return;
      } else {
        currentPlayer.inJail = false;
      }
    }

    await get().movePlayer(currentPlayer.id, result);
  },

  movePlayer: async (playerId, steps) => {
    const { players } = get();
    const playerIndex = players.findIndex(p => p.id === playerId);
    const player = players[playerIndex];

    for (let i = 0; i < steps; i++) {
      player.position = (player.position + 1) % 30;
      set({ players: [...players] });
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    set({
      players,
      isRolling: false,
      currentPlayerIndex: (playerIndex + 1) % players.length,
      lastDiceRoll: steps,
    });
  },

  purchaseProperty: (property) => {
    const { players, currentPlayerIndex } = get();
    const currentPlayer = players[currentPlayerIndex];
    
    if (currentPlayer.coins >= property.price) {
      currentPlayer.coins -= property.price;
      currentPlayer.properties.push(property);
      property.ownerId = currentPlayer.id;
      
      set({
        players,
        showPropertyDialog: false,
        gameMessage: `${currentPlayer.name} ${property.name}'yi satın aldı!`,
      });
    }
  },

  upgradeProperty: (propertyId) => {
    const { players, currentPlayerIndex } = get();
    const currentPlayer = players[currentPlayerIndex];
    const property = currentPlayer.properties.find(p => p.id === propertyId);
    
    if (property && property.level < 5 && currentPlayer.coins >= property.upgradePrice) {
      currentPlayer.coins -= property.upgradePrice;
      property.level++;
      property.rent = Math.floor(property.baseRent * (1 + (property.level * 0.1)));
      property.upgradePrice = Math.floor(property.upgradePrice * 1.5);
      
      set({
        players,
        gameMessage: `${currentPlayer.name} ${property.name}'yi geliştirdi! Yeni seviye: ${property.level}`,
      });
    }
  },

  createAlliance: (name, playerIds) => {
    const alliance: Alliance = {
      id: `alliance-${Date.now()}`,
      name,
      memberIds: playerIds,
      sharedGold: 0,
    };

    const { players, alliances } = get();
    players.forEach(player => {
      if (playerIds.includes(player.id)) {
        player.allianceId = alliance.id;
      }
    });

    set({
      players,
      alliances: [...alliances, alliance],
      gameMessage: `${name} ittifakı kuruldu!`,
    });
  },

  equipItem: (playerId, item) => {
    const { players } = get();
    const player = players.find(p => p.id === playerId);
    
    if (player) {
      const oldItem = player.inventory[item.type];
      player.inventory[item.type] = item;
      
      if (oldItem) {
        player.coins += oldItem.value;
      }
      
      set({
        players,
        gameMessage: `${player.name} ${item.name} kuşandı!`,
      });
    }
  },

  fightBoss: (playerId) => {
    const { players, activeBoss } = get();
    const player = players.find(p => p.id === playerId);
    
    if (player && activeBoss) {
      const winChance = calculateWinChance(player, activeBoss);
      const won = Math.random() < winChance;
      
      if (won) {
        player.coins += activeBoss.rewards.gold;
        player.xp += activeBoss.rewards.xp;
        if (activeBoss.rewards.item) {
          const item = generateRandomItem('legendary');
          player.inventory[item.type] = item;
        }
        
        set({
          players,
          showBossDialog: false,
          gameMessage: `${player.name} ejderhayı yendi ve ödüllerini kazandı!`,
        });
      } else {
        player.coins = Math.floor(player.coins * 0.5);
        set({
          players,
          showBossDialog: false,
          gameMessage: `${player.name} ejderhaya yenildi ve altınlarının yarısını kaybetti!`,
        });
      }
    }
  },

  addToLog: (message) => {
    const { gameLog } = get();
    set({ gameLog: [...gameLog, message] });
  },
}));