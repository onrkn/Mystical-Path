import type { GetState, SetState } from 'zustand';
import type { GameState } from '../../types/game';
import { calculateStrength } from '../../utils/playerUtils';
import { generateRandomItem } from '../../utils/itemGenerator';

export const handleCombatActions = (set: SetState<GameState>, get: GetState<GameState>) => ({
  fightBoss: (playerId: string) => {
    const { players, currentPlayerIndex, activeBoss } = get();
    const player = players.find(p => p.id === playerId);
    
    if (!player || !activeBoss) return;

    const playerStrength = calculateStrength(player);
    const winChance = Math.min(Math.max((playerStrength / (playerStrength + activeBoss.strength)) * 100, 10), 90);
    
    const won = Math.random() * 100 < winChance;
    
    if (won) {
      // Apply gold multiplier from items
      const bonuses = get().calculateItemBonuses(player);
      const goldReward = Math.floor(activeBoss.rewards.gold * bonuses.goldMultiplier);
      const xpReward = Math.floor(activeBoss.rewards.xp * (1 + bonuses.expBonus));
      
      player.coins += goldReward;
      player.xp += xpReward;
      player.cardBonuses += goldReward;

      // Show combat animation
      set({ showCombatAnimation: { visible: true, won: true, reward: { gold: goldReward, xp: xpReward } } });
      setTimeout(() => set({ showCombatAnimation: { visible: false, won: true } }), 3000);
      
      if (activeBoss.rewards.item) {
        const item = generateRandomItem('legendary');
        player.inventory[item.type] = item;
        get().showNotification({
          title: 'Efsanevi Item Kazanıldı',
          message: `${item.name} kazandınız!`,
          type: 'success'
        });
      }
      
      get().showNotification({
        title: 'Boss Yenildi!',
        message: `${player.name} ejderhayı yendi ve ${goldReward} altın, ${xpReward} XP kazandı!`,
        type: 'success'
      });
      get().addToLog(`<span class="text-orange-500">${player.name} ejderhayı yendi! (+${goldReward} altın, +${xpReward} XP)</span>`);
    } else {
      const lostGold = Math.floor(player.coins * 0.5);
      player.coins -= lostGold;
      player.penalties += lostGold;

      // Show combat animation
      set({ showCombatAnimation: { visible: true, won: false } });
      setTimeout(() => set({ showCombatAnimation: { visible: false, won: false } }), 3000);
      
      get().showNotification({
        title: 'Boss Savaşı Kaybedildi',
        message: `${player.name} ejderhaya yenildi ve ${lostGold} altın kaybetti!`,
        type: 'error'
      });
      get().addToLog(`<span class="text-red-500">${player.name} ejderhaya yenildi! (-${lostGold} altın)</span>`);
    }
    
    set({
      players: [...players],
      showBossDialog: false,
      activeBoss: null,
      waitingForDecision: false,
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
    });

    // If next player is bot and no dialogs are open, trigger bot turn
    const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
    if (nextPlayer.isBot && !get().showMarketDialog && !get().showPropertyDialog) {
      setTimeout(() => get().handleBotTurn(), 1000);
    }
  },
});