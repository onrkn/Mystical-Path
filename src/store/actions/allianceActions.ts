import type { GetState, SetState } from 'zustand';
import type { GameState, Alliance } from '../../types/game';

export const handleAllianceActions = (set: SetState<GameState>, get: GetState<GameState>) => ({
  createAlliance: (name: string, playerIds: string[]) => {
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
      showAllianceDialog: false,
    });
    
    get().showNotification({
      title: 'İttifak Kuruldu',
      message: `${name} ittifakı kuruldu!`,
      type: 'success'
    });
    get().addToLog(`<span class="text-purple-500">${name} ittifakı kuruldu!</span>`);
  },

  contributeToAlliance: (playerId: string, amount: number) => {
    const { players, alliances } = get();
    const player = players.find(p => p.id === playerId);
    
    if (player && player.allianceId && player.coins >= amount) {
      const alliance = alliances.find(a => a.id === player.allianceId);
      if (alliance) {
        player.coins -= amount;
        alliance.sharedGold += amount;
        
        set({
          players: [...players],
          alliances: [...alliances],
        });
        
        get().addToLog(`<span class="text-purple-500">${player.name} ittifak kasasına ${amount} altın katkıda bulundu!</span>`);
      }
    }
  },
});