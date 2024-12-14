import { GameState, GetState, SetState } from '../gameStore';
import { calculateItemBonuses } from '../utils/itemUtils';
import { getBotDecision, setBotMoving } from '../../utils/botAI';
import { calculateStrength } from '../../utils/playerUtils';
import { SYMBOLS } from '../../store/slotMachineStore';
import { Square } from '../../types/game';
import { sansKartlari, cezaKartlari } from '../../data/cards';

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
              // Bot'un kira ödemesini hemen yap
              get().addToLog(`<span class="text-yellow-500">🏠 ${player.name}, ${owner.name}'e ${rentToPay} altın kira ödeyecek...</span>`);
              await get().payRent(player, owner, rentToPay);
              advanceToNextPlayer(get, set);
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
        
        // İflas kontrolü
        get().checkPlayerBankruptcy(player);
        
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

      case 'slot':
        if (player.isBot) {
          // Bot'un parası varsa slot oynasın
          if (player.coins >= 100) {
            // Bot'un zar atmasını hemen engelle
            set({ 
              diceRolled: true,
              waitingForDecision: true,
              canRollDice: false,  // Yeni eklenen state
              isBotTurnInProgress: true // Bot'un turunu işaretle
            });
            setBotMoving(true);

            // Bot slot oynuyor mesajı
            get().addToLog(`🎰 ${player.name} slot makinesini deniyor...`);
            
            // Slot sonuçlarını hesapla
            const symbols = Array(3).fill(null).map(() => 
              SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
            );
            
            // Para işlemleri
            player.coins -= 100; // Slot ücreti
            
            // Jackpot katkısı
            const jackpotContribution = 50;
            set(state => ({
              ...state,
              miniJackpot: state.miniJackpot + (jackpotContribution * 0.3),
              megaJackpot: state.megaJackpot + (jackpotContribution * 0.7)
            }));

            // Sembolleri göster
            const symbolsDisplay = symbols.map(s => s.emoji).join(' ');
            get().addToLog(`🎰 Sonuç: ${symbolsDisplay}`);

            // Kazancı hesapla
            const symbolIds = symbols.map(s => s.id);
            let winAmount = 0;
            let message = '';
            let wonJackpot = '';

            // Mega Jackpot - Üç tane 7
            if (symbolIds.every(id => id === 'seven')) {
              winAmount = get().megaJackpot;
              message = `MEGA JACKPOT! ${winAmount} altın kazandı! 🎉`;
              wonJackpot = 'mega';
            }
            // Mini Jackpot - Üç tane çilek
            else if (symbolIds.every(id => id === 'cherry')) {
              winAmount = get().miniJackpot;
              message = `MINI JACKPOT! ${winAmount} altın kazandı! 🎉`;
              wonJackpot = 'mini';
            }
            // Normal kazanç - Üç aynı sembol
            else if (symbolIds[0] === symbolIds[1] && symbolIds[1] === symbolIds[2]) {
              const symbolValue = symbols[0].value;
              winAmount = 100 * symbolValue;
              message = `3x ${symbols[0].emoji} = ${winAmount} altın kazandı!`;
            }
            // İki aynı sembol
            else if (symbolIds[0] === symbolIds[1] || symbolIds[1] === symbolIds[2] || symbolIds[0] === symbolIds[2]) {
              const symbolValue = symbols[1].value;
              winAmount = 50 * symbolValue;
              message = `2x ${symbols[1].emoji} = ${winAmount} altın kazandı!`;
            }

            if (winAmount > 0) {
              player.coins += winAmount;
              
              // Jackpot kazanıldıysa sıfırla
              if (wonJackpot) {
                set(state => ({
                  ...state,
                  [wonJackpot + 'Jackpot']: wonJackpot === 'mini' ? 1000 : 5000
                }));
              }

              get().addToLog(`💰 ${player.name} ${message}`);
            } else {
              get().addToLog(`❌ ${player.name} slot makinesinde 100 altın kaybetti!`);
            }

            // Oyuncuları güncelle
            set({ players: [...get().players] });

            // Sırayı hemen diğer oyuncuya devret
            const nextPlayerIndex = (get().currentPlayerIndex + 1) % get().players.length;
            set({ 
              currentPlayerIndex: nextPlayerIndex,
              diceRolled: false,
              lastDiceRoll: null,
              waitingForDecision: false,
              canRollDice: true,  // Sıradaki oyuncu için zar atmayı etkinleştir
              isBotTurnInProgress: false // Bot turunun bittiğini işaretle
            });
            setBotMoving(false);

            // Eğer sıradaki oyuncu bot ise, onun turunu başlat
            const nextPlayer = get().players[nextPlayerIndex];
            if (nextPlayer.isBot) {
              setTimeout(() => {
                const gameState = get();
                if (!gameState.diceRolled && gameState.canRollDice && !gameState.isBotTurnInProgress) {
                  get().handleBotTurn();
                }
              }, 1500);
            }
          } else {
            get().addToLog(`💸 ${player.name}'in slot oynamak için yeterli parası yok!`);
            // Para yoksa hemen sırayı ilerlet
            advanceToNextPlayer(get, set);
          }
          return; // Önemli: Burada return ekleyerek fonksiyondan çık
        } else {
          // İnsan oyuncu için slot makinesini aç
          get().openSlotMachine(player.id);
        }
        break;

      case 'chance':
        // ... (diğer durumlar)

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