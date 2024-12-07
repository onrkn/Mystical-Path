import type { GetState, SetState } from 'zustand';
import type { GameState, Property } from '../../types/game';
import { calculateItemBonuses } from '../utils/itemUtils';
import { handleBankruptcy } from '../utils/playerUtils';
import { squares } from '../../data/board';

export const handlePropertyActions = (set: SetState<GameState>, get: GetState<GameState>) => ({
  purchaseProperty: (property: Property) => {
    const { players, currentPlayerIndex, settings } = get();
    const currentPlayer = players[currentPlayerIndex];
    
    // Find the square with this property
    const propertySquare = squares.find(s => s.property?.id === property.id);
    
    // Validate that the current player is on this square
    const isPlayerOnProperty = currentPlayer.position === propertySquare?.id;

    if (!isPlayerOnProperty) {
      get().showNotification({
        title: 'Hata',
        message: 'Bu mülkü sadece üzerinde duran oyuncu satın alabilir!',
        type: 'error'
      });
      return;
    }
    
    if (currentPlayer.coins >= property.price) {
      currentPlayer.coins -= property.price;
      currentPlayer.propertyPurchases += property.price;
      currentPlayer.properties.push(property);
      property.ownerId = currentPlayer.id;
      
      // Apply rent multiplier from settings when purchasing
      property.rent = Math.floor(property.baseRent * settings.propertyRentMultiplier);
      
      // Add XP for property purchase
      currentPlayer.xp += 10;
      
      set({
        players,
        showPropertyDialog: false,
        selectedProperty: null,
        waitingForDecision: false,
        currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
      });
      
      get().showNotification({
        title: 'Mülk Satın Alındı',
        message: `${currentPlayer.name} ${property.name}'yi ${property.price} altına satın aldı!`,
        type: 'success'
      });
      get().addToLog(`<span class="text-green-500">${currentPlayer.name} ${property.name}'yi satın aldı!</span>`);

      // If next player is bot and no dialogs are open, trigger bot turn
      const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
      if (nextPlayer.isBot && !get().showMarketDialog && !get().showBossDialog) {
        setTimeout(() => get().handleBotTurn(), 1000);
      }
    }
  },

  upgradeProperty: (propertyId: number) => {
    const { players, currentPlayerIndex, settings } = get();
    const currentPlayer = players[currentPlayerIndex];
    const property = currentPlayer.properties.find(p => p.id === propertyId);
    
    if (property && property.level < 5 && currentPlayer.coins >= property.upgradePrice) {
      currentPlayer.coins -= property.upgradePrice;
      currentPlayer.propertyUpgrades += property.upgradePrice;
      property.level++;
      
      // Calculate new rent with both level bonus and settings multiplier
      const levelBonus = 1 + (property.level * 0.2); // 20% increase per level
      property.rent = Math.floor(property.baseRent * levelBonus * settings.propertyRentMultiplier);
      
      // Update upgrade price for next level
      property.upgradePrice = Math.floor(property.upgradePrice * 1.5);
      
      get().showNotification({
        title: 'Mülk Geliştirildi',
        message: `${currentPlayer.name} ${property.name}'yi geliştirdi! Yeni seviye: ${property.level}`,
        type: 'success'
      });
      get().addToLog(`<span class="text-blue-500">${currentPlayer.name} ${property.name}'yi ${property.level}. seviyeye yükseltti!</span>`);
      
      set({ players: [...players] });
    }
  },

  payRent: (player: GameState['players'][0], owner: GameState['players'][0], amount: number) => {
    const { players, currentPlayerIndex } = get();
    
    // Oyuncunun kira ödeyecek yeterli altını yoksa
    if (player.coins < amount) {
      // Eğer altın miktarı negatife düşecekse direkt iflas et
      handleBankruptcy(player, amount, owner, get, set);
      return;
    }

    // Player can afford rent
    player.coins -= amount;
    player.rentPaid += amount;
    owner.coins += amount;
    owner.rentCollected += amount;
    
    get().showNotification({
      title: 'Kira Ödendi',
      message: `${player.name}, ${owner.name}'e ${amount} altın kira ödedi!`,
      type: 'info'
    });
    get().addToLog(`<span class="text-blue-500">${player.name}, ${owner.name}'e ${amount} altın kira ödedi!</span>`);

    set({
      players: [...players],
      rentInfo: null,
      waitingForDecision: false,
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length
    });

    // If next player is bot, trigger bot turn
    const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
    if (nextPlayer.isBot) {
      setTimeout(() => get().handleBotTurn(), 1000);
    }
  }
});