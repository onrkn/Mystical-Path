import type { GetState, SetState } from 'zustand';
import type { GameState } from '../../types/game';
import { handleBotPropertyUpgrades } from '../../utils/botUtils';

export const handleBotActions = (set: SetState<GameState>, get: GetState<GameState>) => ({
  handleBotTurn: async () => {
    const { players, currentPlayerIndex } = get();
    const currentPlayer = players[currentPlayerIndex];
    
    if (!currentPlayer?.isBot) return;

    try {
      // Clear any lingering states
      set({ 
        isRolling: false,
        waitingForDecision: false,
        showBossDialog: false,
        showMarketDialog: false,
        showPropertyDialog: false,
        showRentDialog: false,
        rentInfo: null,
        selectedProperty: null,
        activeBoss: null
      });

      // Check for property upgrades before rolling
      handleBotPropertyUpgrades(currentPlayer);
      set({ players: [...players] });

      // Wait before bot action
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Roll dice if not in jail
      if (!currentPlayer.inJail) {
        const roll = Math.floor(Math.random() * 6) + 1;
        set({ lastDiceRoll: roll });
        get().addToLog(`<span class="text-gray-500">${currentPlayer.name} ${roll} attı.</span>`);

        // Add delay before moving
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Move player with animation
        await get().movePlayer(currentPlayer.id, roll);
      } else {
        // Skip turn if in jail
        currentPlayer.jailTurnsLeft--;
        if (currentPlayer.jailTurnsLeft <= 0) {
          currentPlayer.inJail = false;
          currentPlayer.jailTurnsLeft = 0;
          get().addToLog(`<span class="text-gray-500">${currentPlayer.name} hapishaneden çıktı!</span>`);
        } else {
          get().addToLog(`<span class="text-gray-500">${currentPlayer.name} hapishanede. Kalan tur: ${currentPlayer.jailTurnsLeft}</span>`);
        }

        // Advance turn
        set({ 
          players: [...players],
          currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
          waitingForDecision: false,
          isRolling: false
        });

        // If next player is bot, continue bot chain after a delay
        const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
        if (nextPlayer?.isBot) {
          setTimeout(() => get().handleBotTurn(), 1500);
        }
      }
    } catch (error) {
      console.error('Error in handleBotTurn:', error);
      // Ensure turn advances even if there's an error
      set({ 
        currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
        waitingForDecision: false,
        isRolling: false
      });

      // If next player is bot, continue bot chain after a delay
      const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
      if (nextPlayer?.isBot) {
        setTimeout(() => get().handleBotTurn(), 1500);
      }
    }
  }
});