import type { GetState, SetState } from 'zustand';
import type { GameState, Square } from '../../types/game';
import { sansKartlari, cezaKartlari } from '../../data/cards';
import { calculateItemBonuses } from '../utils/itemUtils';
import { getBotDecision } from '../../utils/botAI';
import { calculateStrength } from '../../utils/playerUtils';

export function advanceToNextPlayer(get: GetState<GameState>, set: SetState<GameState>) {
  const { players, currentPlayerIndex } = get();
  
  // Clear all dialog states and flags
  set({
    currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
    waitingForDecision: false,
    isRolling: false,
    showBossDialog: false,
    showMarketDialog: false,
    showPropertyDialog: false,
    showRentDialog: false,
    rentInfo: null,
    selectedProperty: null,
    activeBoss: null
  });

  // If next player is bot, trigger bot turn after a delay
  const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
  if (nextPlayer?.isBot) {
    setTimeout(() => get().handleBotTurn(), 1500);
  }
}

export async function handleSquareAction(
  get: GetState<GameState>,
  set: SetState<GameState>,
  playerId: string,
  square: Square
) {
  try {
    const { players, currentPlayerIndex } = get();
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const bonuses = calculateItemBonuses(player);

    // Add delay before processing square effect
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (square.type) {
      case 'boss':
        if (square.boss) {
          if (player.isBot) {
            const playerStrength = calculateStrength(player);
            const winChance = Math.min(Math.max((playerStrength / (playerStrength + square.boss.strength)) * 100, 10), 90);
            
            // Biraz gecikme ekle
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // activeBoss'u ayarla
            set({ activeBoss: square.boss });
            
            if (winChance >= 50) {
              // Log mesajı ekle
              get().addToLog(`<span class="text-orange-500">${player.name} ejderhayla savaşmaya karar verdi! (Kazanma şansı: %${Math.round(winChance)})</span>`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              get().fightBoss(player.id);
            } else {
              // Log mesajı ekle
              get().addToLog(`<span class="text-yellow-500">${player.name} ejderhayla savaşmaktan kaçınıyor! (Kazanma şansı: %${Math.round(winChance)})</span>`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              get().fleeFromBoss();
            }
            return;
          } else {
            set({ 
              showBossDialog: true,
              activeBoss: square.boss,
              waitingForDecision: true,
              isRolling: false
            });
            return; // Don't advance turn until player makes a decision
          }
        }
        break;

      case 'arsa':
        if (square.property && !square.property.ownerId) {
          if (player.isBot) {
            const decision = getBotDecision(player, square);
            if (decision === 'buy') {
              await get().purchaseProperty(square.property);
            } else {
              advanceToNextPlayer(get, set);
            }
          } else {
            set({ 
              showPropertyDialog: true,
              selectedProperty: square.property,
              waitingForDecision: true,
              isRolling: false
            });
            return; // Don't advance turn until player makes a decision
          }
        } else if (square.property?.ownerId && square.property.ownerId !== player.id) {
          const owner = players.find(p => p.id === square.property?.ownerId);
          if (owner) {
            const rentToPay = Math.floor(square.property.rent * (1 - bonuses.rentReduction));
            
            if (player.isBot) {
              await get().payRent(player, owner, rentToPay);
            } else {
              set({
                showRentDialog: true,
                rentInfo: {
                  property: square.property,
                  owner,
                  player
                },
                waitingForDecision: true,
                isRolling: false
              });
              return; // Don't advance turn until player makes a decision
            }
          }
        } else {
          advanceToNextPlayer(get, set);
        }
        break;

      case 'market':
        if (player.isBot) {
          const itemDecision = get().getBotMarketDecision(player);
          if (itemDecision) {
            get().equipItem(player.id, itemDecision);
          } else {
            advanceToNextPlayer(get, set);
          }
        } else {
          set({ 
            showMarketDialog: true, 
            waitingForDecision: true,
            isRolling: false
          });
          return; // Don't advance turn until player makes a decision
        }
        break;

      case 'sans':
        const sansKarti = sansKartlari[Math.floor(Math.random() * sansKartlari.length)];
        let message = sansKarti.description;
        
        if (sansKarti.effect.coins) {
          const coins = Math.floor(sansKarti.effect.coins * bonuses.goldMultiplier);
          player.coins += coins;
          player.cardBonuses += coins;
          message += ` (+${coins} altın)`;
        }
        if (sansKarti.effect.xp) {
          const xp = Math.floor(sansKarti.effect.xp * (1 + bonuses.expBonus));
          player.xp += xp;
          message += ` (+${xp} XP)`;
        }
        
        get().showNotification({
          title: sansKarti.title,
          message,
          type: 'success'
        });
        get().addToLog(`<span class="text-green-500">${player.name}: ${message}</span>`);
        
        // Add delay before advancing turn
        setTimeout(() => advanceToNextPlayer(get, set), 1500);
        break;

      case 'ceza':
        const cezaKarti = cezaKartlari[Math.floor(Math.random() * cezaKartlari.length)];
        let cezaMessage = cezaKarti.description;
        
        if (cezaKarti.effect.coins) {
          const penalty = cezaKarti.effect.coins;
          player.coins += penalty;
          player.penalties -= penalty;
          cezaMessage += ` (${penalty} altın)`;
        }
        if (cezaKarti.effect.xp) {
          const xp = cezaKarti.effect.xp;
          player.xp += xp;
          cezaMessage += ` (${xp} XP)`;
        }
        
        get().showNotification({
          title: cezaKarti.title,
          message: cezaMessage,
          type: 'error'
        });
        get().addToLog(`<span class="text-red-500">${player.name}: ${cezaMessage}</span>`);
        
        // Add delay before advancing turn
        setTimeout(() => advanceToNextPlayer(get, set), 1500);
        break;

      case 'park':
        if (square.effect?.xp) {
          const xp = Math.floor(square.effect.xp * (1 + bonuses.expBonus));
          player.xp += xp;
          
          get().showNotification({
            title: 'Sihirli Park',
            message: `${player.name} parkta dinlendi ve ${xp} XP kazandı!`,
            type: 'success'
          });
          get().addToLog(`<span class="text-emerald-500">${player.name} parkta dinlendi ve ${xp} XP kazandı!</span>`);
        }
        
        // Add delay before advancing turn
        setTimeout(() => advanceToNextPlayer(get, set), 1500);
        break;

      case 'bonus':
        if (square.effect) {
          let bonusMessage = '';
          if (square.effect.coins) {
            const coins = Math.floor(square.effect.coins * bonuses.goldMultiplier);
            player.coins += coins;
            player.cardBonuses += coins;
            bonusMessage += `+${coins} altın `;
          }
          if (square.effect.xp) {
            const xp = Math.floor(square.effect.xp * (1 + bonuses.expBonus));
            player.xp += xp;
            bonusMessage += `+${xp} XP`;
          }
          
          get().showNotification({
            title: 'Bonus!',
            message: `${player.name} bonus kazandı! ${bonusMessage}`,
            type: 'success'
          });
          get().addToLog(`<span class="text-green-500">${player.name} bonus kazandı! ${bonusMessage}</span>`);
        }
        
        // Add delay before advancing turn
        setTimeout(() => advanceToNextPlayer(get, set), 1500);
        break;

      default:
        advanceToNextPlayer(get, set);
        break;
    }

    // Check for level up
    const requiredXP = player.level * 100;
    if (player.xp >= requiredXP) {
      player.level += 1;
      player.xp -= requiredXP;
      player.strength += 1;
      
      get().showNotification({
        title: 'Seviye Atlama!',
        message: `${player.name} seviye ${player.level} oldu! Güç +1`,
        type: 'success'
      });
      get().addToLog(`<span class="text-purple-500">${player.name} seviye ${player.level} oldu! Güç +1</span>`);
    }

    set({ players: [...players] });
  } catch (error) {
    console.error('Error in handleSquareAction:', error);
    // Ensure turn advances even if there's an error
    advanceToNextPlayer(get, set);
  }
}