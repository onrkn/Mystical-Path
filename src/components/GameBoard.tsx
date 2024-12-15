import React, { useEffect } from 'react';
import { BoardSquare } from './BoardSquare';
import { PlayerStats } from './PlayerStats';
import { GameLog } from './GameLog';
import { DiceRoller } from './DiceRoller';
import { Inventory } from './Inventory';
import { squares, king, BOARD_SIZE } from '../data/board';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dice5, 
  ScrollText, 
  Layers, 
  Crown, 
  Sparkles
} from 'lucide-react';

// Kral animasyonu için CSS keyframes
const kingAnimationStyle = `
.king-piece {
  width: 50px;
  height: 50px;
  background-image: url('/king-sprite.svg');
  background-size: cover;
  z-index: 10;
}

.glow-red {
  box-shadow: 0 0 5px 1px rgba(239, 68, 68, 0.3);
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
`;

export function GameBoard() {
  const { players, updateKingPosition, settings } = useGameStore();
  
  useEffect(() => {
    // Kral özelliği kapalıysa hiçbir şey yapma
    if (!settings.kingEnabled) {
      updateKingPosition(-1); // Kral pozisyonunu sıfırla
      return;
    }

    // Sadece mülk karelerini filtrele
    const propertySquares = squares.filter(square => square.type === 'arsa');
    
    if (propertySquares.length === 0) return;

    // İlk kral konumunu rastgele seç
    const initialRandomSquare = propertySquares[Math.floor(Math.random() * propertySquares.length)];
    console.log(`👑 Initial King Position: ${initialRandomSquare.name} (ID: ${initialRandomSquare.id})`);
    updateKingPosition(initialRandomSquare.id);

    const moveKing = () => {
      // Kral özelliği kapalıysa hareketi durdur
      if (!settings.kingEnabled) {
        updateKingPosition(-1);
        return;
      }

      // Önceki konumdan farklı mülk karelerini filtrele
      const currentKingPosition = useGameStore.getState().kingPosition;
      const currentKingSquare = squares.find(s => s.id === currentKingPosition);
      
      const availableSquares = propertySquares.filter(square => 
        square.id !== currentKingPosition
      );
      
      if (availableSquares.length > 0) {
        const randomPropertySquare = availableSquares[Math.floor(Math.random() * availableSquares.length)];
        
        console.log('👑 KING MOVEMENT:', {
          'Previous Position': currentKingSquare ? {
            name: currentKingSquare.name,
            id: currentKingPosition,
            type: currentKingSquare.type
          } : 'None',
          'New Position': {
            name: randomPropertySquare.name,
            id: randomPropertySquare.id,
            type: randomPropertySquare.type
          },
          'Available Squares': availableSquares.map(s => ({
            id: s.id,
            name: s.name,
            type: s.type
          }))
        });
        
        // Kral pozisyonunu güncelle
        updateKingPosition(randomPropertySquare.id);

        // Bilgilendirme
        useGameStore.getState().addNotification({
          message: `Kral ${randomPropertySquare.name} mülküne geldi!`,
          type: 'info'
        });
      }
    };

    // İlk hareketi hemen yap
    moveKing();

    // 60 saniyede bir hareket et
    const kingMovementInterval = setInterval(moveKing, 60000);

    // Temizleme
    return () => {
      clearInterval(kingMovementInterval);
    };
  }, [settings.kingEnabled]); // settings.kingEnabled değiştiğinde effect'i yeniden çalıştır

  // Oyuncu bilgilerini göster
  const renderPlayerInfo = (player: any) => {
    const isActive = player.id === players[useGameStore.getState().currentPlayerIndex].id;
    return (
      <div 
        key={player.id} 
        className={`player-info ${isActive ? 'active' : ''} p-2 rounded-lg`}
        onMouseEnter={() => {
          if (!player.playedSlot) {
            useGameStore.setState({ showSlotMachine: true, slotMachinePlayerId: player.id });
          }
        }}
        onMouseLeave={() => {
          useGameStore.setState({ showSlotMachine: false, slotMachinePlayerId: null });
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: player.color }}
          />
          <div className="flex-1">
            <span style={{ color: player.color }}>{player.name}</span>
            {isActive && <span className="ml-2">(Aktif)</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{kingAnimationStyle}</style>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="space-y-6">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PlayerStats />
          </motion.div>
          
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Inventory />
          </motion.div>
          
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <GameLog />
          </motion.div>
        </div>
        
        <div className="lg:col-span-2 relative">
          <DiceRoller />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3 bg-purple-50 rounded-lg p-3 shadow-sm border border-purple-100">
                <img 
                  src="/board-game.png" 
                  alt="Oyun Tahtası" 
                  className="w-10 h-10 object-contain"
                />
                <h3 className="text-2xl font-bold text-purple-800">Oyun Tahtası</h3>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Kral Bölümü */}
                {settings.kingEnabled && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center bg-gradient-to-r from-yellow-900/80 to-amber-900/80 backdrop-blur-md rounded-md px-3 py-1.5 shadow-lg border border-amber-500/20 text-sm hover:from-yellow-800/80 hover:to-amber-800/80 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="bg-amber-500/20 p-1 rounded-full border border-amber-500/30 shadow-amber-500/20 shadow-inner">
                        <Crown className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="font-medium text-amber-200/90">Kral Aktif</span>
                    </div>
                  </motion.div>
                )}

                {/* Ejderha Sayaçları */}
                {settings.dragonBossWinEnabled && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center bg-gradient-to-r from-red-900/80 to-purple-900/80 backdrop-blur-md rounded-md px-3 py-1.5 shadow-lg border border-purple-500/20 text-sm hover:from-red-800/80 hover:to-purple-800/80 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <img 
                        src="/dragon.png" 
                        alt="Dragon" 
                        className="w-5 h-5 -mt-0.5 brightness-110 contrast-110 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] animate-pulse-subtle" 
                      />
                      <div className="flex items-center gap-2">
                        {players.map((player) => (
                          <div 
                            key={player.id} 
                            className="flex items-center gap-1 bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-500/20 shadow-inner hover:bg-purple-900/50 transition-colors duration-200"
                            title={`${player.name}'nin ejderha skoru`}
                          >
                            <div 
                              className="w-2.5 h-2.5 rounded-full ring-1 ring-white/10 shadow-lg" 
                              style={{ backgroundColor: player.color }}
                            />
                            <span 
                              className="font-medium tracking-wide" 
                              style={{ 
                                color: player.color,
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                              }}
                            >
                              {player.dragonKills}/3
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-8 gap-2 relative">
              <AnimatePresence>
                {squares.map((square, index) => (
                  <motion.div
                    key={square.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  >
                    <BoardSquare
                      square={square}
                      players={players.filter(p => p.position === index)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
