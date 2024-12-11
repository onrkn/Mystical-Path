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
  
  // Güvenlik kontrolü: owedAmount ve player.coins'in sayı olup olmadığını kontrol et
  if (isNaN(owedAmount) || owedAmount === undefined) {
    console.error(`Geçersiz borç miktarı: ${owedAmount}`);
    owedAmount = 0;
  }

  if (isNaN(player.coins) || player.coins === undefined) {
    console.error(`Geçersiz oyuncu parası: ${player.coins}`);
    player.coins = 0;
  }
  
  // Oyuncunun altını 0 veya negatifse hemen iflas et
  if (player.coins <= 0) {
    const totalCoins = Math.abs(player.coins); // Mutlak değeri al
    player.coins = 0; // Altını 0'a sabitle
    
    // Transfer remaining coins to creditor if exists
    if (creditor) {
      creditor.coins += totalCoins;
      creditor.rentCollected += totalCoins;
      
      // Detaylı log mesajı ekle
      get().addToLog(`<span class="text-red-500">💥 İFLAS: ${player.name}, ${totalCoins} altın borcu ödeyemedi ve ${creditor.name}'e aktardı!</span>`);
    } else {
      // Eğer alacaklı yoksa, parayı oyun bankasına aktar
      get().addToLog(`<span class="text-red-500">💥 İFLAS: ${player.name}, ${totalCoins} altın borcu ödeyemedi ve oyun bankasına aktardı!</span>`);
    }

    // Tüm mülkleri otomatik olarak açık artırmaya çıkar
    player.properties.forEach(property => {
      property.ownerId = null;
      property.level = 1;
      property.rent = property.baseRent;
      property.upgradePrice = Math.floor(property.baseRent * 1.5);
      
      // Mülkü açık artırmaya çıkar
      get().addToLog(`<span class="text-blue-500">🏘️ ${property.name} açık artırmada!</span>`);
    });

    // Oyuncunun mülklerini sıfırla
    player.properties = [];

    // Show bankruptcy dialog for human players
    if (!player.isBot) {
      set({ 
        showBankruptcyDialog: true,
        bankruptPlayer: player
      });
    }

    // Daha detaylı log mesajları
    get().addToLog(`<span class="text-yellow-500">🏴 ${player.name} tüm varlıklarını kaybetti!</span>`);

    // Remove player from game
    const playerIndex = players.findIndex(p => p.id === player.id);
    players.splice(playerIndex, 1);

    // Show notification
    get().showNotification({
      title: 'İFLAS!',
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
      get().addToLog(`<span class="text-green-500">🏆 ${players[0].name} oyunu kazandı!</span>`);
      set({ winner: players[0] });
    } else {
      // İflas eden bot ise zar sırasını atla
      const nextPlayer = players[playerIndex % players.length];
      if (nextPlayer?.isBot) {
        // Zar sırasını ve konumunu sıfırla
        nextPlayer.position = -1;
        nextPlayer.isBankrupt = true;
        setTimeout(() => get().handleBotTurn(), 1500);
      }
    }
  } else {
    // Oyuncunun altını varsa normal işlemlere devam et
    player.coins -= owedAmount;
    
    if (creditor) {
      creditor.coins += owedAmount;
      creditor.rentCollected += owedAmount;
    }
  }
}