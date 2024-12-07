import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { calculateStrength } from '../utils/playerUtils';
import { Skull, Swords, Shield, Coins, Star, Gift, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MUSIC_TRACKS, playBackgroundMusic, stopBackgroundMusic } from '../utils/soundUtils';
import { Howl } from 'howler';

export function BossBattle() {
  const { players, currentPlayerIndex, activeBoss, fightBoss, fleeFromBoss } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  useEffect(() => {
    // Ejderha savaş müziğini çal
    stopBackgroundMusic(); // Önceki müziği durdur
    const bossBattleMusic = new Howl({
      src: [MUSIC_TRACKS.BOSS_BATTLE],
      html5: true,
      loop: true,
      volume: 0.2, // Biraz daha yumuşak ses
      onloaderror: (id, err) => {
        console.error('Boss Battle müzik yükleme hatası:', err);
      },
      onplayerror: (id, err) => {
        console.error('Boss Battle müzik çalma hatası:', err);
      }
    });

    bossBattleMusic.play();

    // Bileşen unmount olduğunda müziği durdur
    return () => {
      bossBattleMusic.stop();
      bossBattleMusic.unload();
      // Ana tema müziğini tekrar başlat
      playBackgroundMusic();
    };
  }, []); // Sadece ilk render'da çalış

  if (!activeBoss) return null;

  const playerStrength = calculateStrength(currentPlayer);
  const winChance = Math.min(Math.max((playerStrength / (playerStrength + activeBoss.strength)) * 100, 10), 90);

  const handleFight = () => {
    // Savaş butonuna tıklandığında animasyonlu geçiş
    const button = document.querySelector('#fightButton');
    if (button) {
      button.classList.add('animate-pulse-slow');
      setTimeout(() => {
        fightBoss(currentPlayer.id);
      }, 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-xl max-w-md w-full shadow-2xl border border-gray-700/50 relative"
      >
        {/* Arka planda kralın olduğu kareyi göster */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url(/king-sprite.svg)`, 
              backgroundSize: '100px',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </div>

        <div className="text-center mb-6 relative">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="inline-block relative"
          >
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
            <Skull className="w-16 h-16 mx-auto text-red-500 drop-shadow-glow relative z-10" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mt-2 mb-1"
          >
            Ejderha Savaşı!
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400"
          >
            Savaş veya Kaç!
          </motion.p>
        </div>

        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-8 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50"
        >
          <div className="text-center">
            <div className="bg-blue-500/20 p-3 rounded-lg mb-2 border border-blue-500/20">
              <Shield className="w-8 h-8 text-blue-400 drop-shadow-glow" />
            </div>
            <h3 className="font-bold text-white">{currentPlayer.name}</h3>
            <p className="text-sm text-blue-400">Güç: {playerStrength}</p>
          </div>
          
          <motion.div
            animate={{ x: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-bold text-red-500"
          >
            <Swords className="w-8 h-8 drop-shadow-glow" />
          </motion.div>

          <div className="text-center">
            <div className="bg-red-500/20 p-3 rounded-lg mb-2 border border-red-500/20">
              <Skull className="w-8 h-8 text-red-400 drop-shadow-glow" />
            </div>
            <h3 className="font-bold text-white">{activeBoss.name}</h3>
            <p className="text-sm text-red-400">Güç: {activeBoss.strength}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Kazanma Şansı</span>
            <span className="text-white font-bold">%{Math.round(winChance)}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden p-[1px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${winChance}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className={`h-full rounded-full ${
                winChance >= 50 
                  ? 'bg-gradient-to-r from-green-500 to-green-400' 
                  : 'bg-gradient-to-r from-red-500 to-red-400'
              } shadow-lg`}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700/50"
        >
          <h4 className="font-bold text-white mb-3 flex items-center">
            <Gift className="w-5 h-5 text-yellow-500 mr-2 drop-shadow-glow" />
            Zafer Ödülleri
          </h4>
          <div className="space-y-2">
            <div className="flex items-center text-gray-300">
              <Coins className="w-4 h-4 text-yellow-500 mr-2" />
              <span>{activeBoss.rewards.gold} Altın</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Star className="w-4 h-4 text-blue-400 mr-2" />
              <span>{activeBoss.rewards.xp} XP</span>
            </div>
            {activeBoss.rewards.item && (
              <div className="flex items-center text-gray-300">
                <Gift className="w-4 h-4 text-purple-400 mr-2" />
                <span>Efsanevi Item Şansı</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.button
            id="fightButton"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFight}
            className="relative bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-6 rounded-lg font-bold shadow-lg hover:from-red-700 hover:to-red-600 transition-all flex items-center justify-center gap-2 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/30 to-red-400/0 group-hover:translate-x-full transition-transform duration-500" />
            <Swords className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Savaş!</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fleeFromBoss()}
            className="relative bg-gradient-to-r from-gray-600 to-gray-500 text-white py-3 px-6 rounded-lg font-bold shadow-lg hover:from-gray-700 hover:to-gray-600 transition-all flex items-center justify-center gap-2 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-400/0 via-gray-400/30 to-gray-400/0 group-hover:translate-x-full transition-transform duration-500" />
            <ChevronRight className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Kaç</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}