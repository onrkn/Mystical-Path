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
import { calculateRent } from './actions/propertyActions';
import { playSoundEffect, SOUND_EFFECTS } from '../utils/soundUtils';
import { MARKET_MUSIC } from '../utils/soundUtils';

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gameStarted: boolean;
  winner: null;
  lastDiceRoll: number[] | null;
  lastDiceRoll2: number | null;
  gameMessage: string;
  gameLog: string[];
  alliances: any[];
  isRolling: boolean;
  isBotTurnInProgress: boolean;
  showPropertyDialog: boolean;
  showBossDialog: boolean;
  showMarketDialog: boolean;
  showSettings: boolean;
  showAllianceDialog: boolean;
  showRentDialog: boolean;
  showBankruptcyDialog: boolean;
  showCombatAnimation: null;
  selectedProperty: null;
  activeBoss: null;
  squares: any[];
  settings: any;
  notifications: any[];
  waitingForDecision: boolean;
  isMoving: boolean;
  rentInfo: null;
  bankruptPlayer: null;
  kingPosition: number;
  weather: string;
  showSlotMachine: boolean;
  slotMachinePlayerId: null;
  miniJackpot: number;
  megaJackpot: number;
  canRollDice: boolean;
}

const initialState: GameState = {
  players: [],
  currentPlayerIndex: 0,
  gameStarted: false,
  winner: null,
  lastDiceRoll: null,
  lastDiceRoll2: null,
  gameMessage: '',
  gameLog: [],
  alliances: [],
  isRolling: false,
  isBotTurnInProgress: false,
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
  squares: [],
  settings: {
    ...defaultSettings,
    musicEnabled: true,
    soundEffectsEnabled: true,
    dragonBossWinEnabled: true,
  },
  notifications: [],
  waitingForDecision: false,
  isMoving: false,
  rentInfo: null,
  bankruptPlayer: null,
  kingPosition: 0,
  weather: 'none',
  showSlotMachine: false,
  slotMachinePlayerId: null,
  miniJackpot: 1000,
  megaJackpot: 5000,
  canRollDice: true,
};

const applyPenaltyCard = (cardId: string, playerId: string, set: (state: any) => void, get: () => GameState) => {
  const player = get().players.find(p => p.id === playerId);
  if (!player) return;

  const card = cezaKartlari.find(c => c.id === cardId);
  if (!card || card.type !== 'penalty') return;

  if (card.effect === 'property_transfer') {
    if (player.properties.length > 0) {
      const players = get().players;
      const minStrength = Math.min(...players.map(p => p.strength));
      const weakestPlayers = players.filter(p => p.strength === minStrength && p.id !== playerId);

      if (weakestPlayers.length > 0) {
        const targetPlayer = weakestPlayers[Math.floor(Math.random() * weakestPlayers.length)];

        const propertyIndex = Math.floor(Math.random() * player.properties.length);
        const property = player.properties[propertyIndex];

        player.properties = player.properties.filter((_, index) => index !== propertyIndex);

        targetPlayer.properties.push(property);

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
      const penaltyCost = 200;
      player.coins = Math.max(0, player.coins - penaltyCost);
      player.penalties += penaltyCost;

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

  if (player.properties.length > 0) {
    const players = get().players;
    const minStrength = Math.min(...players.map(p => p.strength));
    const weakestPlayers = players.filter(p => p.strength === minStrength && p.id !== playerId);

    if (weakestPlayers.length > 0) {
      const targetPlayer = weakestPlayers[Math.floor(Math.random() * weakestPlayers.length)];

      const propertyIndex = Math.floor(Math.random() * player.properties.length);
      const property = player.properties[propertyIndex];

      player.properties = player.properties.filter((_, index) => index !== propertyIndex);
      targetPlayer.properties.push(property);

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
    const penaltyCost = 200;
    player.coins = Math.max(0, player.coins - penaltyCost);
    player.penalties += penaltyCost;

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
  const { players, squares } = state;
  const player = players.find(p => p.id === playerId);
  if (!player) return;

  const square = squares[player.position];
  const squareType = square.type;

  if (squareType === 'chance') {
    const card = cezaKartlari[Math.floor(Math.random() * cezaKartlari.length)];
    if (card.type === 'penalty') {
      applyPenaltyCard(card.id, playerId, set, get);
    } else if (card.type === 'reward') {
      const rewardAmount = card.amount || 200;
      player.coins += rewardAmount;
      player.rewards += rewardAmount;
      
      get().addToLog(`<span class="text-green-500">🎁 ${player.name} şans kartından ${rewardAmount} altın kazandı!</span>`);
      
      get().showNotification({
        title: 'Şans Kartı!',
        message: `${card.name}: ${rewardAmount} altın kazandınız!`,
        type: 'success'
      });

      set({
        players: [...players],
        waitingForDecision: false
      });
    }
  } else if (squareType === 'treasure') {
    const treasureAmount = Math.floor(Math.random() * 300) + 200;
    player.coins += treasureAmount;
    player.rewards += treasureAmount;

    get().addToLog(`<span class="text-green-500">💎 ${player.name} hazineden ${treasureAmount} altın buldu!</span>`);
    
    get().showNotification({
      title: 'Hazine Bulundu!',
      message: `${treasureAmount} altın buldunuz!`,
      type: 'success'
    });

    set({
      players: [...players],
      waitingForDecision: false
    });
  } else if (squareType === 'penalty') {
    handlePenaltySquare(playerId, set, get);
  }

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % players.length;
  const nextPlayer = players[nextPlayerIndex];

  set({
    currentPlayerIndex: nextPlayerIndex,
    isRolling: false
  });

  if (nextPlayer.isBot && !nextPlayer.isBankrupt) {
    setTimeout(() => get().handleBotTurn(), 1000);
  }
};

const rollDice = async (set: (state: any) => void, get: () => GameState) => {
  const state = get();
  const currentPlayer = state.players[state.currentPlayerIndex];

  if (!currentPlayer || state.isMoving || state.waitingForDecision || currentPlayer.isBot || !state.canRollDice) {
    return;
  }

  set({ isRolling: true });

  try {
    // Zar sesi çal
    playSoundEffect(SOUND_EFFECTS.DICE_ROLL, 0.5);

    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const totalRoll = roll1 + roll2;

    set({ lastDiceRoll: [roll1, roll2] });

    get().addToLog(`<span class="text-gray-500">${currentPlayer.name} ${roll1} ve ${roll2} attı. (Toplam: ${totalRoll})</span>`);

    await new Promise(resolve => setTimeout(resolve, 1000));
    await get().movePlayer(currentPlayer.id, totalRoll);
  } catch (error) {
    console.error('Error in rollDice:', error);
    set({
      currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
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
  localStorage.setItem('gameSettings', JSON.stringify({
    ...get().settings,
    ...newSettings
  }));

  const state = get();
  const players = [...state.players];
  const updatedSquares = state.squares.map(square => {
    const updatedSquare = { ...square };

    if (updatedSquare.property) {
      updatedSquare.property.price = Math.floor(
        updatedSquare.property.baseRent * 5 *
        (newSettings.propertyPriceMultiplier || state.settings.propertyPriceMultiplier)
      );

      if (!updatedSquare.property.ownerId) {
        updatedSquare.property.rent = Math.floor(
          updatedSquare.property.baseRent *
          (newSettings.propertyRentMultiplier || state.settings.propertyRentMultiplier)
        );
      }
    }

    return updatedSquare;
  });

  const updatedPlayers = players.map(player => {
    const updatedPlayer = { ...player };

    updatedPlayer.properties = updatedPlayer.properties.map(property => ({
      ...property,
      rent: Math.floor(
        property.baseRent *
        (1 + (property.level - 1) * 0.2) *
        (newSettings.propertyRentMultiplier || state.settings.propertyRentMultiplier)
      )
    }));

    return updatedPlayer;
  });

  set(state => ({
    ...state,
    settings: {
      ...state.settings,
      ...newSettings
    },
    players: updatedPlayers
  }));

  state.squares.splice(0, state.squares.length, ...updatedSquares);
};

const loadSavedSettings = () => {
  const savedSettings = localStorage.getItem('gameSettings');
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      return {
        ...defaultSettings,
        musicEnabled: parsedSettings.musicEnabled !== undefined ? parsedSettings.musicEnabled : true,
        soundEffectsEnabled: parsedSettings.soundEffectsEnabled !== undefined ? parsedSettings.soundEffectsEnabled : true,
        dragonBossWinEnabled: parsedSettings.dragonBossWinEnabled !== undefined ? parsedSettings.dragonBossWinEnabled : true,
        ...parsedSettings
      };
    } catch (error) {
      console.error('Ayarlar yüklenirken hata oluştu:', error);
      return defaultSettings;
    }
  }
  return defaultSettings;
};

const initializeGame = (playerNames: string[], playerTypes: ('human' | 'bot')[], set: (state: any) => void, get: () => GameState) => {
  const { settings } = get();

  get().squares.forEach(square => {
    if (square.property) {
      square.property.price = Math.floor(square.property.baseRent * 5 * settings.propertyPriceMultiplier);
      square.property.rent = Math.floor(square.property.baseRent * settings.propertyRentMultiplier);
      square.property.level = 1;
      square.property.ownerId = null;
    }
  });

  const initialPlayers = playerNames.map((name, index) => ({
    id: index.toString(),
    name,
    type: playerTypes[index],
    color: generatePlayerColor(index),
    position: 0,
    coins: get().settings.startingMoney,
    score: 0,
    level: 1,
    xp: 0,
    strength: 1,
    properties: [],
    inventory: {},
    isBankrupt: false,
    isBot: playerTypes[index] === 'bot',
    defeatedBosses: 0,
    dragonKills: 0,
    startBonusCount: 0,
    rentCollected: 0,
    cardBonuses: 0,
    itemSales: 0,
    propertyPurchases: 0,
    propertyUpgrades: 0,
    rentPaid: 0,
    itemPurchases: 0,
    penalties: 0,
    canBuy: true,
    canTrade: true,
    canUseItems: true
  }));

  set({
    players: initialPlayers,
    currentPlayerIndex: 0,
    gameStarted: true,
    winner: null,
    gameMessage: '',
    gameLog: [],
    squares: squares,
    showPropertyDialog: false,
    showBossDialog: false,
    showMarketDialog: false,
    showSettings: false,
    showAllianceDialog: false,
    showRentDialog: false,
    showBankruptcyDialog: false,
    selectedProperty: null,
    activeBoss: null,
    waitingForDecision: false,
    isMoving: false,
    rentInfo: null,
    showSlotMachine: false,
    slotMachinePlayerId: null
  });
};

const fleeFromBoss = (set: (state: any) => void, get: () => GameState) => {
  const state = get();
  const { players, currentPlayerIndex } = state;
  const currentPlayer = players[currentPlayerIndex];

  // Dialog'u kapat
  set({
    showBossDialog: false,
    activeBoss: null,
    waitingForDecision: false
  });

  // Log mesajı ekle
  get().addToLog(`🏃‍♂️ ${currentPlayer.name} ejderhadan kaçtı!`);

  // Bildirim göster
  get().showNotification({
    title: 'Kaçış Başarılı!',
    message: `${currentPlayer.name} ejderhadan kaçmayı başardı!`,
    type: 'info'
  });

  // Sırayı diğer oyuncuya geçir
  const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  const nextPlayer = players[nextPlayerIndex];

  set({
    currentPlayerIndex: nextPlayerIndex,
    isRolling: false
  });

  if (nextPlayer.isBot && !nextPlayer.isBankrupt) {
    setTimeout(() => get().handleBotTurn(), 1000);
  }
};

import { squares } from '../data/board';

const handlePropertyRent = (currentPlayer: any, square: any, set: (state: any) => void, get: () => GameState) => {
  const state = get();
  const { players, currentPlayerIndex } = state;

  const propertyOwner = players.find(p => p.id === square.property.ownerId);

  if (!propertyOwner || propertyOwner.id === currentPlayer.id) return;

  const rentAmount = calculateRent(square.property, get);

  console.log('Property Rent Debug:', {
    currentPlayer: currentPlayer.name,
    owner: propertyOwner.name,
    rentAmount
  });

  set({
    rentInfo: {
      player: currentPlayer,
      owner: propertyOwner,
      amount: rentAmount
    },
    showRentDialog: true
  });

  payRent(currentPlayer, propertyOwner, rentAmount, set, get);
};

const updateKingPosition = (position: number, set: (state: any) => void, get: () => GameState) => {
  const { players, kingPosition } = get();

  set({ kingPosition: position });

  players.forEach(player => {
    player.properties.forEach(property => {
      if (property.id !== position) {
        property.rent = calculateRent(property, get);
      } else {
        if (get().settings.kingEnabled) {
          property.rent = calculateRent(property, get) * 10;
        }
      }
    });
  });

  set({ players: [...players] });
};

const updateWeather = (weather: GameState['weather'], set: (state: any) => void, get: () => GameState) => {
  if (!get().settings.weatherEnabled) return;

  const { players } = get();
  set({ weather });

  players.forEach(player => {
    player.properties?.forEach(property => {
      property.rent = calculateRent(property, get);
    });
  });
  set({ players: [...players] });

  if (weather === 'rain') {
    get().addToLog(`<span class="text-blue-500">Yağmur başladı! Tüm kiralar %50 düşük.</span>`);
    get().showNotification({
      title: 'Hava Durumu',
      message: 'Yağmur başladı! Tüm kiralar %50 düşük.',
      type: 'info'
    });
  } else {
    get().addToLog(`<span class="text-yellow-500">Yağmur durdu! Kiralar normale döndü.</span>`);
    get().showNotification({
      title: 'Hava Durumu',
      message: 'Yağmur durdu! Kiralar normale döndü.',
      type: 'info'
    });
  }
};

const WEATHER_CHANGE_INTERVAL = 2 * 60 * 1000;
const RAIN_DURATION = 30 * 1000;
const RAIN_COOLDOWN = 2 * 60 * 1000;

let weatherTimeout: NodeJS.Timeout | null = null;
let rainCooldownTimeout: NodeJS.Timeout | null = null;

const startWeatherSystem = (set: (state: any) => void, get: () => GameState) => {
  if (!get().settings.weatherEnabled) return;

  const changeWeather = () => {
    if (!get().settings.weatherEnabled) {
      stopWeatherSystem();
      return;
    }

    if (get().weather === 'none') {
      updateWeather('rain', set, get);

      rainCooldownTimeout = setTimeout(() => {
        updateWeather('none', set, get);

        weatherTimeout = setTimeout(changeWeather, WEATHER_CHANGE_INTERVAL);
      }, RAIN_DURATION);
    }
  };

  weatherTimeout = setTimeout(changeWeather, WEATHER_CHANGE_INTERVAL);
};

const stopWeatherSystem = () => {
  if (weatherTimeout) {
    clearTimeout(weatherTimeout);
    weatherTimeout = null;
  }
  if (rainCooldownTimeout) {
    clearTimeout(rainCooldownTimeout);
    rainCooldownTimeout = null;
  }
};

const initializeWeatherSystem = (set: (state: any) => void, get: () => GameState) => {
  if (get().settings.weatherEnabled) {
    startWeatherSystem(set, get);
  }
};

const handleBankruptcy = (playerId: string, rentAmount?: number, owner?: any, set?: (state: any) => void, get?: () => GameState) => {
  const gameGet = get || useGameStore.getState;
  const gameSet = set || useGameStore.setState;
  const state = gameGet();
  const { players, squares } = state;

  console.log('🚨 Bankruptcy Handler:', {
    playerId,
    players: players.length,
    squares: squares ? (Array.isArray(squares) ? squares.length : 'NOT AN ARRAY') : 'UNDEFINED',
    currentPlayerIndex: state.currentPlayerIndex
  });

  const bankruptPlayer = players.find(p => p.id === playerId);
  if (!bankruptPlayer) {
    console.error('❌ Bankruptcy: Player not found!', { playerId, players });
    return;
  }

  console.log('🏴 Bankruptcy Details:', {
    playerName: bankruptPlayer.name,
    coins: bankruptPlayer.coins,
    properties: bankruptPlayer.properties.length,
    rentAmount,
    owner
  });

  const rentOwner = owner || state.rentInfo?.owner;

  const playerProperties = squares.filter((square: any) =>
    square.property && square.property.ownerId === playerId
  );

  playerProperties.forEach((square: any) => {
    if (square.property) {
      square.property.ownerId = null;
      square.property.level = 1;
      square.property.rent = square.property.baseRent;
      square.property.upgradePrice = Math.floor(square.property.baseRent * 1.5);

      gameGet().addToLog(`<span class="text-blue-500">🏘️ ${square.property.name} açık artırmada!</span>`);
    }
  });

  bankruptPlayer.properties = [];

  if (rentOwner && bankruptPlayer.coins > 0) {
    const transferAmount = bankruptPlayer.coins;
    rentOwner.coins += transferAmount;
    rentOwner.rentCollected += transferAmount;

    gameGet().addToLog(`<span class="text-green-500">💰 ${rentOwner.name}, ${bankruptPlayer.name}'den ${transferAmount} altın aldı!</span>`);
  }

  bankruptPlayer.coins = 0;

  gameGet().showNotification({
    title: 'İFLAS!',
    message: `${bankruptPlayer.name} iflas etti ve oyundan elendi!`,
    type: 'error'
  });

  gameGet().addToLog(`<span class="text-red-500">💥 ${bankruptPlayer.name} iflas etti!</span>`);

  const updatedPlayers = players.filter((p: Player) => p.id !== playerId);

  console.log('🏁 Post Bankruptcy:', {
    remainingPlayers: updatedPlayers.length,
    currentPlayerIndex: state.currentPlayerIndex
  });

  if (updatedPlayers.length === 1) {
    const winner = updatedPlayers[0];
    gameSet({ 
      players: updatedPlayers,
      winner,
      gameMessage: `${winner.name} oyunu kazandı!`,
      gameStarted: false
    });

    gameGet().showNotification({
      title: 'Oyun Bitti!',
      message: `${winner.name} oyunu kazandı!`,
      type: 'success'
    });
    gameGet().addToLog(`<span class="text-green-500">🏆 ${winner.name} oyunu kazandı!</span>`);

    return;
  }

  let newCurrentPlayerIndex = state.currentPlayerIndex;
  if (newCurrentPlayerIndex >= updatedPlayers.length) {
    newCurrentPlayerIndex = 0;
  }

  gameSet({
    players: updatedPlayers,
    squares: [...squares],
    currentPlayerIndex: newCurrentPlayerIndex,
    gameMessage: `${bankruptPlayer.name} oyundan elendi!`,
    showRentDialog: false,
    rentInfo: null,
    waitingForDecision: false,
    isRolling: false
  });

  gameGet().showNotification({
    title: 'İFLAS!',
    message: `${bankruptPlayer.name} oyundan elendi!`,
    type: 'error'
  });
  gameGet().addToLog(`<span class="text-red-500">🏴 ${bankruptPlayer.name} oyundan elendi!</span>`);

  const nextPlayer = updatedPlayers[newCurrentPlayerIndex];
  if (nextPlayer.isBot && !nextPlayer.isBankrupt) {
    setTimeout(() => gameGet().handleBotTurn(), 1500);
  }
};

const payRent = (player: any, owner: any, rentAmount: number, set: (state: any) => void, get: () => GameState) => {
  const state = get();
  const { players } = state;

  console.log('PayRent Debug:', {
    player: player.name,
    owner: owner.name,
    rentAmount,
    playerCoins: player.coins
  });

  if (player.coins < rentAmount) {
    const transferAmount = player.coins;

    owner.coins += transferAmount;
    owner.rentCollected += transferAmount;

    get().addToLog(`<span class="text-green-500">💰 ${owner.name}, ${player.name}'den ${transferAmount} altın aldı!</span>`);

    player.properties.forEach(prop => {
      const squareIndex = state.squares.findIndex(sq => sq.property?.id === prop.id);
      if (squareIndex !== -1 && state.squares[squareIndex].property) {
        state.squares[squareIndex].property.ownerId = null;
        state.squares[squareIndex].property.level = 1;
        state.squares[squareIndex].property.rent = state.squares[squareIndex].property.baseRent;
      }
    });

    handleBankruptcy(player.id, rentAmount, owner, set, get);

    get().showNotification({
      title: 'İFLAS!',
      message: `${player.name} kirayı ödeyemedi ve oyundan elendi!`,
      type: 'error'
    });
  } else {
    player.coins -= rentAmount;
    player.rentPaid += rentAmount;
    owner.coins += rentAmount;
    owner.rentCollected += rentAmount;

    get().addToLog(`<span class="text-green-500">💰 ${player.name}, ${owner.name}'e ${rentAmount} altın kira ödedi!</span>`);

    get().showNotification({
      title: 'Kira Ödendi!',
      message: `${player.name}, ${owner.name}'e ${rentAmount} altın kira ödedi!`,
      type: 'success'
    });
  }
};

const checkPlayerBankruptcy = (player: any, set?: (state: any) => void, get?: () => GameState) => {
  console.log('🚨 Bankruptcy Check:', {
    playerName: player.name,
    coins: player.coins,
    isBankrupt: player.isBankrupt
  });

  if (player.coins <= 0 && !player.isBankrupt) {
    const gameGet = get || useGameStore.getState;
    const gameSet = set || useGameStore.setState;

    console.log('🏴 Triggering Bankruptcy for:', player.name);

    gameGet().addToLog(`<span class="text-red-600">💥 ${player.name} iflas etti! Parası ${player.coins} altına düştü.</span>`);

    gameGet().showNotification({
      title: 'İFLAS!',
      message: `${player.name} iflas etti. Parası ${player.coins} altına düştü.`,
      type: 'error'
    });

    gameGet().handleBankruptcy(player.id, gameSet, gameGet);
  }
};

const handlePropertyPurchase = (playerId: string, propertyId: string, set: (state: any) => void, get: () => GameState) => {
  const state = get();
  const { players, squares } = state;

  const player = players.find(p => p.id === playerId);
  if (!player) return;

  const squareIndex = squares.findIndex(sq => sq.property?.id === propertyId);
  if (squareIndex === -1 || !squares[squareIndex].property) return;

  const property = squares[squareIndex].property;

  if (player.coins < property.price) {
    get().showNotification({
      title: 'Yetersiz Bakiye!',
      message: 'Mülkü satın almak için yeterli bakiyeniz yok!',
      type: 'error'
    });
    return;
  }

  player.coins -= property.price;
  player.propertyPurchases += property.price;
  player.properties.push(property);

  property.ownerId = playerId;

  set({
    players: [...players],
    squares: [...squares]
  });

  get().showNotification({
    title: 'Mülk Satın Alındı!',
    message: `${property.name} mülkü satın alındı!`,
    type: 'success'
  });
};

const upgradeProperty = (propertyId: string, set: (state: any) => void, get: () => GameState) => {
  const { upgradeProperty } = handlePropertyActions(set, get);
  upgradeProperty(propertyId);
};

const purchaseItem = (playerId: string, item: any, set: (state: any) => void, get: () => GameState) => {
  const state = get();
  const { players } = state;

  const player = players.find(p => p.id === playerId);
  if (!player) return;

  if (player.coins < item.price) {
    get().showNotification({
      title: 'Yetersiz Bakiye!',
      message: 'Itemi satın almak için yeterli bakiyeniz yok!',
      type: 'error'
    });
    return;
  }

  player.coins -= item.price;
  player.itemPurchases += item.price;
  player.inventory[item.name] = (player.inventory[item.name] || 0) + 1;

  set({
    players: [...players]
  });

  get().showNotification({
    title: 'Item Satın Alındı!',
    message: `${item.name} itemi satın alındı!`,
    type: 'success'
  });
};

const sellItem = (playerId: string, slotName: string, set: (state: any) => void, get: () => GameState) => {
  const state = get();
  const { players } = state;

  const player = players.find(p => p.id === playerId);
  if (!player) return;

  const item = player.inventory[slotName];
  if (!item) return;

  const sellPrice = Math.floor(item.price * 0.5);
  player.coins += sellPrice;
  player.itemSales += sellPrice;
  player.inventory[slotName] -= 1;

  set({
    players: [...players]
  });

  get().showNotification({
    title: 'Item Satıldı!',
    message: `${slotName} itemi satıldı!`,
    type: 'success'
  });
};

const openSlotMachine = (playerId: string, set: (state: any) => void, get: () => GameState) => {
  const { players } = get();
  const player = players.find(p => p.id === playerId);
  if (player) {
    set({ players: [...players], showSlotMachine: true, slotMachinePlayerId: playerId });
  }
};

const closeSlotMachine = (set: (state: any) => void, get: () => GameState) => {
  const { currentPlayerIndex, players } = get();

  set({
    showSlotMachine: false,
    slotMachinePlayerId: null,
    waitingForDecision: false,
    currentPlayerIndex: (currentPlayerIndex + 1) % players.length
  });

  const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
  if (nextPlayer?.isBot) {
    setTimeout(() => get().handleBotTurn(), 1000);
  }
};

const updateJackpots = (contribution: number, set: (state: any) => void) => {
  set(state => ({
    ...state,
    miniJackpot: state.miniJackpot + (contribution * 0.3),
    megaJackpot: state.megaJackpot + (contribution * 0.7)
  }));
};

const resetJackpot = (type: 'mini' | 'mega', set: (state: any) => void) => {
  set(state => ({
    ...state,
    [type + 'Jackpot']: type === 'mini' ? 1000 : 5000
  }));
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,
  settings: loadSavedSettings(),
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
  handlePropertyRent: (currentPlayer: any, square: any) => handlePropertyRent(currentPlayer, square, set, get),
  updateWeather: (weather: GameState['weather']) => updateWeather(weather, set, get),
  startWeatherSystem: () => startWeatherSystem(set, get),
  stopWeatherSystem: () => stopWeatherSystem(),
  initializeWeatherSystem: () => initializeWeatherSystem(set, get),
  handleBankruptcy: (playerId: string, rentAmount?: number, owner?: any) => handleBankruptcy(playerId, rentAmount, owner, set, get),
  payRent: (player: any, owner: any, rentAmount: number) => payRent(player, owner, rentAmount, set, get),
  checkPlayerBankruptcy: (player: any) => checkPlayerBankruptcy(player, set, get),
  handlePropertyPurchase: (playerId: string, propertyId: string) => handlePropertyPurchase(playerId, propertyId, set, get),
  upgradeProperty: (propertyId: string) => upgradeProperty(propertyId, set, get),
  purchaseItem: (playerId: string, item: any) => purchaseItem(playerId, item, set, get),
  sellItem: (playerId: string, slotName: string) => sellItem(playerId, slotName, set, get),
  openSlotMachine: (playerId: string) => openSlotMachine(playerId, set, get),
  closeSlotMachine: () => closeSlotMachine(set, get),
  updateJackpots: (contribution: number) => updateJackpots(contribution, set),
  resetJackpot: (type: 'mini' | 'mega') => resetJackpot(type, set)
}));

export default useGameStore;