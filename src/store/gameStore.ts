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
  kingPosition: 0,
  weather: 'none'
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
  // Yeni ayarları localStorage'a kaydet
  localStorage.setItem('gameSettings', JSON.stringify({
    ...get().settings,
    ...newSettings
  }));

  // Mevcut oyun durumunu al
  const state = get();
  const players = [...state.players];
  const updatedSquares = squares.map(square => {
    // Kopyalama yaparak orijinal veriyi değiştirmiyoruz
    const updatedSquare = { ...square };
    
    // Mülk varsa kira ve fiyatları güncelle
    if (updatedSquare.property) {
      // Mülk fiyatını güncelle
      updatedSquare.property.price = Math.floor(
        updatedSquare.property.baseRent * 5 * 
        (newSettings.propertyPriceMultiplier || state.settings.propertyPriceMultiplier)
      );

      // Sahibi olmayan mülklerin kirasını güncelle
      if (!updatedSquare.property.ownerId) {
        updatedSquare.property.rent = Math.floor(
          updatedSquare.property.baseRent * 
          (newSettings.propertyRentMultiplier || state.settings.propertyRentMultiplier)
        );
      }
    }

    return updatedSquare;
  });

  // Oyuncuların mülklerinin kirasını güncelle
  const updatedPlayers = players.map(player => {
    const updatedPlayer = { ...player };
    
    // Her mülkün kirasını güncelle
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

  // Ayarları ve güncellenmiş verileri kaydet
  set(state => ({
    ...state,
    settings: {
      ...state.settings,
      ...newSettings
    },
    players: updatedPlayers
  }));

  // Global squares nesnesini de güncelle
  squares.splice(0, squares.length, ...updatedSquares);
};

const loadSavedSettings = () => {
  const savedSettings = localStorage.getItem('gameSettings');
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      return {
        ...defaultSettings,
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
  const { players } = get();
  const owner = players.find(p => p.id === square.property?.ownerId);
  
  if (!owner || !square.property) return;

  // Kira miktarını hesapla
  let rentAmount = square.property.rent;
  
  // Kral özelliği açıksa ve kral bu mülkteyse kira 10 katına çıkar
  if (get().settings.kingEnabled && get().kingPosition === square.id) {
    rentAmount *= 10;
  }

  // Oyuncunun kira ödeyecek yeterli altını yoksa
  if (currentPlayer.coins < rentAmount) {
    // Eğer altın miktarı negatife düşecekse direkt iflas et
    handleBankruptcy(currentPlayer, rentAmount, owner, get, set);
    return;
  }

  // Normal kira ödeme işlemi
  currentPlayer.coins -= rentAmount;
  owner.coins += rentAmount;
  owner.rentCollected += rentAmount;

  // Log ve bildirim
  get().addToLog(`<span class="text-blue-500">${currentPlayer.name}, ${owner.name}'e ${rentAmount} altın kira ödedi!</span>`);

  // Oyun durumunu güncelle
  set({
    players: [...players],
    showRentDialog: false,
    rentInfo: null,
    waitingForDecision: false,
    currentPlayerIndex: (get().currentPlayerIndex + 1) % players.length
  });

  // Sonraki oyuncu bot ise bot turunu başlat
  const nextPlayer = players[(get().currentPlayerIndex + 1) % players.length];
  if (nextPlayer.isBot) {
    setTimeout(() => get().handleBotTurn(), 1000);
  }
};

const updateKingPosition = (position: number, set: (state: any) => void, get: () => GameState) => {
  // Mevcut oyuncuları al
  const { players } = get();
  
  // Kral pozisyonunu güncelle
  set({ kingPosition: position });
  
  // Tüm oyuncuların mülklerinin kiralarını yeniden hesapla
  players.forEach(player => {
    player.properties.forEach(property => {
      property.rent = calculateRent(property, get);
    });
  });
  
  // Oyuncuları güncelle
  set({ players: [...players] });
};

const updateWeather = (weather: GameState['weather'], set: (state: any) => void, get: () => GameState) => {
  // Hava durumu ayarı kapalıysa hiçbir şey yapma
  if (!get().settings.weatherEnabled) return;

  const { players } = get();
  set({ weather });
  
  // Tüm mülklerin kiralarını güncelle
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

// Weather system constants
const WEATHER_CHANGE_INTERVAL = 2 * 60 * 1000; // 2 dakika
const RAIN_DURATION = 30 * 1000; // 30 saniye
const RAIN_COOLDOWN = 2 * 60 * 1000; // 2 dakika

let weatherTimeout: NodeJS.Timeout | null = null;
let rainCooldownTimeout: NodeJS.Timeout | null = null;

const startWeatherSystem = (set: (state: any) => void, get: () => GameState) => {
  // Hava durumu ayarı kapalıysa başlatma
  if (!get().settings.weatherEnabled) return;

  const changeWeather = () => {
    // Hava durumu ayarı hala açıksa devam et
    if (!get().settings.weatherEnabled) {
      stopWeatherSystem();
      return;
    }

    // Yağmur için cooldown kontrolü
    if (get().weather === 'none') {
      updateWeather('rain', set, get);
      
      // Yağmuru 30 saniye sonra durdur
      rainCooldownTimeout = setTimeout(() => {
        updateWeather('none', set, get);
        
        // Sonraki hava değişimi için zamanlayıcı
        weatherTimeout = setTimeout(changeWeather, WEATHER_CHANGE_INTERVAL);
      }, RAIN_DURATION);
    }
  };

  // İlk hava değişimi zamanlayıcısını kur
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

// Oyun başladığında ve ayarlar değiştiğinde weather sistemini kontrol et
const initializeWeatherSystem = (set: (state: any) => void, get: () => GameState) => {
  // Hava durumu ayarı açıksa sistemi başlat
  if (get().settings.weatherEnabled) {
    startWeatherSystem(set, get);
  }
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,
  settings: loadSavedSettings(), // Kaydedilen ayarları yükle
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
  initializeWeatherSystem: () => initializeWeatherSystem(set, get)
}));

export default useGameStore;