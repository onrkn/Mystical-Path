import type { Player } from '../types/game';

const PLAYER_COLORS = [
  '#FF4136', // Bright Red
  '#2ECC40', // Bright Green
  '#0074D9', // Bright Blue
  '#FFDC00', // Bright Yellow
  '#B10DC9', // Purple
  '#FF851B', // Orange
];

export function calculateStrength(player: Player): number {
  let strength = player.strength;

  // Add strength from properties
  strength += player.properties.length;

  // Add strength from items
  Object.values(player.inventory).forEach(item => {
    if (!item) return;
    
    switch (item.rarity) {
      case 'legendary':
        strength += 2;
        break;
      case 'rare':
        strength += 1;
        break;
    }
  });

  return strength;
}

export function generatePlayerColor(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

export function handleBankruptcy(player: Player, owedAmount: number, creditor: Player | null, get: any, set: any): void {
  const { players } = get();
  
  // Transfer remaining coins to creditor if exists
  if (creditor && player.coins > 0) {
    creditor.coins += player.coins;
    creditor.rentCollected += player.coins;
  }

  // Release all properties
  player.properties.forEach(property => {
    property.ownerId = null;
    property.level = 1;
    property.rent = property.baseRent;
    property.upgradePrice = Math.floor(property.baseRent * 1.5);
  });

  // Show bankruptcy dialog for human players
  if (!player.isBot) {
    set({ 
      showBankruptcyDialog: true,
      bankruptPlayer: player
    });
  }

  // Add to game log
  get().addToLog(`<span class="text-red-500">${player.name} iflas etti! ${owedAmount} altın borcu ödeyemedi.</span>`);
  if (creditor) {
    get().addToLog(`<span class="text-yellow-500">${creditor.name}, ${player.coins} altın aldı.</span>`);
  }
  if (player.properties.length > 0) {
    get().addToLog(`<span class="text-blue-500">${player.name}'nin tüm mülkleri satışa çıktı!</span>`);
  }

  // Remove player from game
  const playerIndex = players.findIndex(p => p.id === player.id);
  players.splice(playerIndex, 1);

  // Show notification
  get().showNotification({
    title: 'İflas!',
    message: `${player.name} iflas etti ve oyundan elendi!`,
    type: 'error'
  });

  // Update game state
  set({ 
    players: [...players],
    currentPlayerIndex: players.length > 0 ? playerIndex % players.length : 0,
    showRentDialog: false,
    rentInfo: null,
    waitingForDecision: false,
    isRolling: false
  });

  // If only one player remains, they win
  if (players.length === 1) {
    get().showNotification({
      title: 'Oyun Bitti!',
      message: `${players[0].name} oyunu kazandı!`,
      type: 'success'
    });
    get().addToLog(`<span class="text-green-500">${players[0].name} oyunu kazandı!</span>`);
    set({ winner: players[0] });
  } else {
    // If next player is bot, trigger bot turn after a delay
    const nextPlayer = players[playerIndex % players.length];
    if (nextPlayer?.isBot) {
      setTimeout(() => get().handleBotTurn(), 1500);
    }
  }
}