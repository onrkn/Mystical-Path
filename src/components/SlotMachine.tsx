import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Coins, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const SYMBOLS = [
  { id: 'seven', symbol: <div className="w-8 h-8 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: 'url(/7.png)' }} />, value: 7 },
  { id: 'cherry', symbol: '🍒', value: 5 },
  { id: 'lemon', symbol: '🍋', value: 3 },
  { id: 'orange', symbol: '🍊', value: 2 },
  { id: 'grape', symbol: '🍇', value: 4 },
  { id: 'watermelon', symbol: '🍉', value: 6 },
  { id: 'bell', symbol: '🔔', value: 5 },
  { id: 'star', symbol: '⭐', value: 6 },
];

const SPIN_DURATION = 2000; // 2 saniye
const CLOSE_DELAY = 3000; // 3 saniye

interface SlotMachineProps {
  onClose: () => void;
  playerId: string;
}

export function SlotMachine({ onClose, playerId }: SlotMachineProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningSymbols, setSpinningSymbols] = useState([
    SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]
  ]);
  const [finalSymbols, setFinalSymbols] = useState([
    SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]
  ]);
  const [lastWin, setLastWin] = useState<{ amount: number; message: string } | null>(null);
  const [cooldownTimer, setCooldownTimer] = useState(3);
  const [cooldownProgress, setCooldownProgress] = useState(0);
  
  const { players, showNotification, addToLog, miniJackpot, megaJackpot } = useGameStore();
  const player = players.find(p => p.id === playerId);

  useEffect(() => {
    if (lastWin !== null) {
      // Her 100ms'de bir progress'i güncelle
      const progressInterval = setInterval(() => {
        setCooldownProgress(prev => {
          const newProgress = prev + (100 / 30); // 3 saniye = 30 * 100ms
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 100);

      // Her saniye sayacı güncelle
      const timerInterval = setInterval(() => {
        setCooldownTimer(prev => prev - 1);
      }, 1000);

      // 3 saniye sonra pencereyi kapat
      const closeTimeout = setTimeout(() => {
        clearInterval(progressInterval);
        clearInterval(timerInterval);
        onClose();
      }, 3000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(timerInterval);
        clearTimeout(closeTimeout);
      };
    }
  }, [lastWin]);

  const spinReels = () => {
    if (!player || player.coins < 100 || isSpinning) return;

    // 100 altın ödeme
    player.coins -= 100;
    setIsSpinning(true);

    // Jackpotları güncelle
    const jackpotContribution = 50; // Kaybedilen miktarın %50'si
    useGameStore.setState(state => ({
      miniJackpot: state.miniJackpot + (jackpotContribution * 0.3), // %30'u mini jackpota
      megaJackpot: state.megaJackpot + (jackpotContribution * 0.7), // %70'i mega jackpota
    }));

    // Rastgele semboller seç
    const newSymbols = Array(3).fill(null).map(() => 
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    );
    setFinalSymbols(newSymbols);

    // Spinning interval
    const interval = setInterval(() => {
      setSpinningSymbols(Array(3).fill(null).map(() => 
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ));
    }, 100);

    // Spin animasyonu bittikten sonra
    setTimeout(() => {
      clearInterval(interval);
      setIsSpinning(false);
      setSpinningSymbols(newSymbols);
      checkWin(newSymbols);
    }, SPIN_DURATION);
  };

  const checkWin = (symbols: typeof SYMBOLS) => {
    const symbolIds = symbols.map(s => s.id);
    let winAmount = 0;
    let message = '';
    let wonJackpot = '';

    // Mega Jackpot - Üç tane 7
    if (symbolIds.every(id => id === 'seven')) {
      winAmount = megaJackpot;
      message = `🎉 MEGA JACKPOT! ${winAmount} altın kazandınız!`;
      wonJackpot = 'mega';
    }
    // Mini Jackpot - Üç tane çilek
    else if (symbolIds.every(id => id === 'cherry')) {
      winAmount = miniJackpot;
      message = `🎉 MINI JACKPOT! ${winAmount} altın kazandınız!`;
      wonJackpot = 'mini';
    }
    // Normal kazanç - Üç aynı sembol
    else if (symbolIds[0] === symbolIds[1] && symbolIds[1] === symbolIds[2]) {
      const symbolValue = symbols[0].value;
      winAmount = 100 * symbolValue;
      message = `3x ${symbols[0].symbol} = ${winAmount} altın! (100x${symbolValue})`;
    }
    // İki aynı sembol
    else if (symbolIds[0] === symbolIds[1] || symbolIds[1] === symbolIds[2] || symbolIds[0] === symbolIds[2]) {
      const symbolValue = symbols[1].value;
      winAmount = 50 * symbolValue;
      message = `2x aynı sembol = ${winAmount} altın! (50x${symbolValue})`;
    } else {
      message = 'Kazanamadınız!';
    }

    setLastWin({ amount: winAmount, message });

    if (winAmount > 0) {
      player.coins += winAmount;
      
      // Jackpot kazanıldıysa sıfırla
      if (wonJackpot) {
        useGameStore.setState(state => ({
          [wonJackpot + 'Jackpot']: wonJackpot === 'mini' ? 1000 : 5000 // Başlangıç değerlerine dön
        }));
        
        // Ekstra konfeti efekti
        Array(5).fill(0).forEach((_, i) => {
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 90,
              origin: { y: 0.6 }
            });
          }, i * 300);
        });
      } else {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      showNotification({
        title: wonJackpot ? 'JACKPOT!' : 'Slot Makinesi Kazancı!',
        message: `Tebrikler! ${winAmount} altın kazandınız!`,
        type: 'success'
      });
      addToLog(`<span class="text-green-500">${player.name} slot makinesinden ${winAmount} altın kazandı!</span>`);
    } else {
      showNotification({
        title: 'Slot Makinesi',
        message: 'Maalesef kazanamadınız. Tekrar deneyin!',
        type: 'warning'
      });
      addToLog(`<span class="text-red-500">${player.name} slot makinesinde 100 altın kaybetti!</span>`);
    }
  };

  const handleClose = () => {
    // Eğer hala dönüyorsa veya kazanç gösteriliyorsa kapatma
    if (isSpinning || lastWin === null) return;
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 w-[900px] h-[600px] rounded-2xl shadow-2xl border border-yellow-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-500/10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-yellow-500">Mistik Slot Makinesi</h2>
            <span className="text-sm text-gray-400">Her oyun 100 altın</span>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100%-64px)]">
          {/* Sol Panel - Slot Makinesi */}
          <div className="flex-1 p-6 border-r border-yellow-500/10">
            {/* Oyuncu Bilgisi */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-yellow-500">{player?.name?.[0]}</span>
                </div>
                <div>
                  <div className="text-yellow-500 font-medium">{player?.name}</div>
                  <div className="text-sm text-gray-400">Bakiye: {player?.coins?.toLocaleString()} 💰</div>
                </div>
              </div>
            </div>

            {/* Slot Makinesi */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <div className="flex justify-center gap-4 mb-6">
                {(isSpinning ? spinningSymbols : finalSymbols).map((symbol, index) => (
                  <motion.div
                    key={index}
                    className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center text-4xl shadow-lg border border-yellow-500/20"
                    animate={isSpinning ? {
                      y: [0, -10, 0],
                      scale: [1, 1.05, 1],
                      transition: { duration: 0.3, repeat: Infinity }
                    } : {}}
                  >
                    {symbol.symbol}
                  </motion.div>
                ))}
              </div>

              <button
                onClick={spinReels}
                disabled={!player || player.coins < 100 || isSpinning || lastWin !== null}
                className="relative w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:text-gray-300 overflow-hidden"
              >
                {lastWin !== null ? (
                  <>
                    <div 
                      className="absolute left-0 top-0 h-full bg-yellow-600 transition-all duration-100"
                      style={{ width: `${cooldownProgress}%` }}
                    />
                    <span className="relative z-10">Kapanıyor ({cooldownTimer}s)</span>
                  </>
                ) : isSpinning ? (
                  'Dönüyor...'
                ) : (
                  'Çevir (100 💰)'
                )}
              </button>
            </div>

            {/* Son Kazanç */}
            {lastWin && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center p-3 rounded-lg mb-6 font-medium ${
                  lastWin.amount > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                }`}
              >
                {lastWin.message}
              </motion.div>
            )}

            {/* Sembol Değerleri - Minimal */}
            <div className="grid grid-cols-4 gap-3 text-sm">
              {SYMBOLS.map((symbol, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-800/30 p-2 rounded-lg">
                  <div className="text-2xl">{symbol.symbol}</div>
                  <div className="text-yellow-500/70">{symbol.value}x</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ Panel - Jackpotlar ve Bilgi */}
          <div className="w-[300px] p-6 bg-gray-900/50">
            {/* Mega Jackpot */}
            <motion.div 
              className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 rounded-xl mb-4 border border-orange-500/20"
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-orange-400 text-sm font-medium mb-1">MEGA JACKPOT</div>
              <div className="text-2xl font-bold text-orange-500 mb-1">
                {Math.floor(megaJackpot).toLocaleString()} 💰
              </div>
              <div className="text-xs text-orange-400/70">3x 7️⃣ ile kazan!</div>
            </motion.div>

            {/* Mini Jackpot */}
            <motion.div 
              className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4 rounded-xl mb-6 border border-purple-500/20"
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <div className="text-purple-400 text-sm font-medium mb-1">MINI JACKPOT</div>
              <div className="text-2xl font-bold text-purple-500 mb-1">
                {Math.floor(miniJackpot).toLocaleString()} 💰
              </div>
              <div className="text-xs text-purple-400/70">3x 🍒 ile kazan!</div>
            </motion.div>

            {/* Ödül Tablosu */}
            <div className="space-y-3">
              <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                <div className="text-green-400 text-sm font-medium">3x Aynı Sembol</div>
                <div className="text-xl font-bold text-green-500">100x</div>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                <div className="text-blue-400 text-sm font-medium">2x Aynı Sembol</div>
                <div className="text-xl font-bold text-blue-500">50x</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
