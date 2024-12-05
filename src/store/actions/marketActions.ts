import type { GetState, SetState } from 'zustand';
import type { GameState, Item } from '../../types/game';

export const handleMarketActions = (set: SetState<GameState>, get: GetState<GameState>) => ({
  equipItem: (playerId: string, item: Item) => {
    const { players, currentPlayerIndex } = get();
    const player = players.find(p => p.id === playerId);
    
    if (player && player.coins >= item.value) {
      const oldItem = player.inventory[item.type];
      
      // Deduct item cost
      player.coins -= item.value;
      player.itemPurchases += item.value;
      
      // Add old item value to player's coins if exists
      if (oldItem) {
        const sellValue = oldItem.value; // Full value refund
        player.coins += sellValue;
        player.itemSales += sellValue;
        get().showNotification({
          title: 'Item Satıldı',
          message: `Eski item ${sellValue} altına satıldı!`,
          type: 'info'
        });
      }

      // Equip new item
      player.inventory[item.type] = item;
      
      // Close market dialog and advance turn
      set({
        players: [...players],
        showMarketDialog: false,
        waitingForDecision: false,
        currentPlayerIndex: (currentPlayerIndex + 1) % players.length
      });
      
      get().showNotification({
        title: 'Item Kuşanıldı',
        message: `${player.name} ${item.name} kuşandı!`,
        type: 'success'
      });
      get().addToLog(`<span class="text-yellow-500">${player.name} ${item.name} kuşandı!</span>`);

      // If next player is bot, trigger bot turn after a delay
      const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
      if (nextPlayer?.isBot) {
        setTimeout(() => get().handleBotTurn(), 1500);
      }
    } else {
      if (!player.isBot) {
        get().showNotification({
          title: 'Yetersiz Altın',
          message: `Bu itemi almak için yeterli altınınız yok!`,
          type: 'error'
        });
      }
    }
  },
});