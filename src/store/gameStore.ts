import { create } from 'zustand';
import type { GameState } from '../types/game';
import { defaultSettings } from '../config/gameSettings';
import { cezaKartlari } from '../data/cards';
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
  notifications: [],
  waitingForDecision: false,
  isMoving: false,
  rentInfo: null,
  bankruptPlayer: null,
  kingPosition: 0
};

const applyPenaltyCard = (cardId: string, playerId: string, set: (state: any) => void, get: () => GameState) => {
  const player = get().players.find(p => p.id === playerId);
  if (!player) return;

  const card = cezaKartlari.find(c => c.id === cardId);
  if (!card || card.type !== 'penalty') return;

  if (card.effect === 'property_transfer') {
    if (player.properties.length > 0) {
      // Find player(s) with lowest strength
      const players = get().players;
      const minStrength = Math.min(...players.map(p => p.strength));
      const weakestPlayers = players.filter(p => p.strength === minStrength && p.id !== playerId);
      
      if (weakestPlayers.length > 0) {
        // Randomly select one of the weakest players
        const targetPlayer = weakestPlayers[Math.floor(Math.random() * weakestPlayers.length)];
        
        // Randomly select a property to transfer
        const propertyIndex = Math.floor(Math.random() * player.properties.length);
        const property = player.properties[propertyIndex];
        
        // Remove property from current player
        player.properties = player.properties.filter((_, index) => index !== propertyIndex);
        
        // Add property to target player
        targetPlayer.properties.push(property);

        // Update game state
        set(state => ({
          ...state,
          players: state.players.map(p => 
            p.id === player.id ? player : 
            p.id === targetPlayer.id ? targetPlayer : p
          ),
          lastAction: {
            type: 'penalty',
            message: `${player.name} oyuncusunun ${property.name} mülkü ${targetPlayer.name} oyuncusuna transfer edildi!`
          }
        }));
      }
    } else {
      // Mülkü olmayan oyuncu için alternatif ceza
      const penaltyCost = 200; // Mülk transferi yerine 200 altın cezası
      player.coins = Math.max(0, player.coins - penaltyCost);
      
      set(state => ({
        ...state,
        players: state.players.map(p => p.id === player.id ? player : p),
        lastAction: {
          type: 'penalty',
          message: `${player.name} oyuncusunun mülkü olmadığı için ${penaltyCost} altın cezası ödedi!`
        }
      }));
    }
  } else {
    // Handle other penalty effects...
    set(state => ({
      ...state,
      lastAction: {
        type: 'penalty',
        message: `${player.name} oyuncusu ${card.name} ceza kartını çekti!`
      }
    }));
  }
};

const handlePenaltySquare = (playerId: string, set: (state: any) => void, get: () => GameState) => {
  const player = get().players.find(p => p.id === playerId);
  if (!player) return;

  // Eğer oyuncunun mülkü varsa
  if (player.properties.length > 0) {
    // En zayıf oyuncuyu bul
    const players = get().players;
    const minStrength = Math.min(...players.map(p => p.strength));
    const weakestPlayers = players.filter(p => p.strength === minStrength && p.id !== playerId);
    
    if (weakestPlayers.length > 0) {
      // Rastgele bir zayıf oyuncu seç
      const targetPlayer = weakestPlayers[Math.floor(Math.random() * weakestPlayers.length)];
      
      // Rastgele bir mülk seç
      const propertyIndex = Math.floor(Math.random() * player.properties.length);
      const property = player.properties[propertyIndex];
      
      // Mülkü transfer et
      player.properties = player.properties.filter((_, index) => index !== propertyIndex);
      targetPlayer.properties.push(property);

      // Oyun durumunu güncelle
      set(state => ({
        ...state,
        players: state.players.map(p => 
          p.id === player.id ? player : 
          p.id === targetPlayer.id ? targetPlayer : p
        ),
        lastAction: {
          type: 'penalty',
          message: `${player.name} oyuncusunun ${property.name} mülkü ${targetPlayer.name} oyuncusuna transfer edildi!`
        }
      }));
    }
  } else {
    // Mülkü olmayan oyuncu için para cezası
    const penaltyCost = 200;
    player.coins = Math.max(0, player.coins - penaltyCost);
    
    set(state => ({
      ...state,
      players: state.players.map(p => p.id === player.id ? player : p),
      lastAction: {
        type: 'penalty',
        message: `${player.name} oyuncusunun mülkü olmadığı için ${penaltyCost} altın cezası ödedi!`
      }
    }));
  }
};

const handleSquareEffect = (playerId: string, set: (state: any) => void, get: () => GameState) => {
  const state = get();
  const currentPlayer = state.players.find(p => p.id === playerId);
  if (!currentPlayer) return;

  const square = squares[currentPlayer.position];
  
  switch (square.type) {
    case 'arsa':
      if (square.property) {
        if (!square.property.ownerId) {
          // Satın alma seçeneği
          set({ showBuyModal: true });
        } else if (square.property.ownerId !== currentPlayer.id) {
          // Kira öde
          get().handlePropertyRent(currentPlayer, square);
        }
      }
      break;
    case 'normal':
      // Normal kare, bir şey yapma
      break;
    case 'sans':
      // Şans kartı çek
      get().drawChanceCard(playerId);
      break;
    case 'ceza':
      // Ceza karesi
      get().handlePenaltySquare(playerId);
      break;
    case 'market':
      // Market karesi
      break;
    case 'park':
      // Park karesi
      if (square.effect) {
        currentPlayer.xp += square.effect.xp || 0;
        set(state => ({
          ...state,
          players: state.players.map(p => p.id === playerId ? currentPlayer : p),
          lastAction: {
            type: 'park',
            message: `${currentPlayer.name} dinlenerek ${square.effect.xp} XP kazandı!`
          }
        }));
      }
      break;
    case 'bonus':
      // Bonus karesi
      if (square.effect) {
        currentPlayer.coins += square.effect.coins || 0;
        currentPlayer.xp += square.effect.xp || 0;
        set(state => ({
          ...state,
          players: state.players.map(p => p.id === playerId ? currentPlayer : p),
          lastAction: {
            type: 'bonus',
            message: `${currentPlayer.name} ${square.effect.coins} altın ve ${square.effect.xp} XP kazandı!`
          }
        }));
      }
      break;
    case 'boss':
      // Boss karesi
      break;
  }
};

const rollDice = async (set: (state: any) => void, get: () => GameState) => {
  const { players, currentPlayerIndex, isMoving, waitingForDecision } = get();
  const currentPlayer = players[currentPlayerIndex];

  if (!currentPlayer || isMoving || waitingForDecision || currentPlayer.isBot) {
    return;
  }

  set({ isRolling: true });

  try {
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const totalRoll = roll1 + roll2;
    
    set({ lastDiceRoll: roll1, lastDiceRoll2: roll2 });
    
    get().addToLog(`<span class="text-gray-500">${currentPlayer.name} ${roll1} ve ${roll2} attı. (Toplam: ${totalRoll})</span>`);

    await new Promise(resolve => setTimeout(resolve, 1000));
    await get().movePlayer(currentPlayer.id, totalRoll);
  } catch (error) {
    console.error('Error in rollDice:', error);
    set({ 
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
      waitingForDecision: false,
      isRolling: false
    });
  }
};

const showNotification = (notification: any, set: (state: any) => void) => {
  set({ notification });
  setTimeout(() => set({ notification: null }), 3000);
};

const clearNotification = (set: (state: any) => void) => {
  set({ notification: null });
};

const addToLog = (message: string, set: (state: any) => void, get: () => GameState) => {
  const { gameLog } = get();
  set({ gameLog: [...gameLog, message] });
};

const updateSettings = (newSettings: any, set: (state: any) => void, get: () => GameState) => {
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
};

const initializeGame = (playerNames: string[], playerTypes: ('human' | 'bot')[], set: (state: any) => void, get: () => GameState) => {
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
};

const fleeFromBoss = (set: (state: any) => void, get: () => GameState) => {
  const { players, currentPlayerIndex } = get();
  const currentPlayer = players[currentPlayerIndex];

  if (!currentPlayer) return;

  get().addToLog(`<span class="text-yellow-500">${currentPlayer.name} ejderhayla savaşmaktan kaçındı!</span>`);
  
  set({
    showBossDialog: false,
    activeBoss: null,
    waitingForDecision: false,
    isRolling: false
  });

  // Sıradaki oyuncuya geç
  const nextIndex = (currentPlayerIndex + 1) % players.length;
  set({ currentPlayerIndex: nextIndex });

  // Eğer sıradaki oyuncu bot ise ve açık dialog yoksa, bot turunu başlat
  const nextPlayer = players[nextIndex];
  if (nextPlayer.isBot && !get().showMarketDialog && !get().showPropertyDialog) {
    setTimeout(() => get().handleBotTurn(), 1000);
  }
};

import { squares } from '../data/board';

const handlePropertyRent = (currentPlayer: any, square: any, set: (state: any) => void, get: () => GameState) => {
  if (!square.property?.ownerId || square.property.ownerId === currentPlayer.id) return;

  const owner = get().players.find(p => p.id === square.property?.ownerId);
  if (!owner) return;

  // Kral pozisyonunu al
  const kingPosition = get().kingPosition;
  const kingSquare = squares.find(s => s.id === kingPosition);

  // Temel kirayı hesapla
  const baseRent = square.property.baseRent * square.property.level;
  
  // Kral'ın konumunu property ID'si ile kontrol et
  const rentAmount = kingSquare?.property?.id === square.property.id
    ? baseRent * 10  // Kral bu mülkte ise x10 kira
    : baseRent;      // Değilse normal kira

  // Kira ödeme bildirimi
  const rentMessage = kingSquare?.property?.id === square.property.id
    ? `${currentPlayer.name}, ${owner.name}'in ${square.name} mülküne geldi. Kral burada olduğu için ${rentAmount} 💎 (x10) kira ödedi!`
    : `${currentPlayer.name}, ${owner.name}'in ${square.name} mülküne geldi ve ${rentAmount} 💎 kira ödedi.`;

  // Kirayı öde
  currentPlayer.coins -= rentAmount;
  owner.coins += rentAmount;

  // Bildirim ekle
  get().addNotification({
    message: rentMessage,
    type: 'info'
  });
};

const updateKingPosition = (position: number, set: (state: any) => void, get: () => GameState) => {
  console.log('🔔 UPDATING KING POSITION:', {
    'New Position': position,
    'Square': squares.find(s => s.id === position)
  });
  
  set((state) => ({
    ...state,
    kingPosition: position
  }));
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

  rollDice: () => rollDice(set, get),

  showNotification: (notification) => showNotification(notification, set),

  clearNotification: () => clearNotification(set),

  addToLog: (message: string) => addToLog(message, set, get),

  updateSettings: (newSettings) => updateSettings(newSettings, set, get),

  initializeGame: (playerNames: string[], playerTypes: ('human' | 'bot')[]) => initializeGame(playerNames, playerTypes, set, get),

  fleeFromBoss: () => fleeFromBoss(set, get),
  handlePenaltySquare: (playerId: string) => handlePenaltySquare(playerId, set, get),
  handleSquareEffect: (playerId: string) => handleSquareEffect(playerId, set, get),
  applyPenaltyCard: (cardId: string, playerId: string) => applyPenaltyCard(cardId, playerId, set, get),
  addNotification: (notification) => set((state) => {
    return {
      notifications: [...state.notifications, notification]
    };
  }),
  updateKingPosition: (position: number) => updateKingPosition(position, set, get),
  handlePropertyRent: (currentPlayer: any, square: any) => handlePropertyRent(currentPlayer, square, set, get)
}));

export default useGameStore;