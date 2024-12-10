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
  Gamepad2, 
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
              <div className="flex items-center space-x-3">
                <Gamepad2 className="w-8 h-8 text-purple-500" />
                <h3 className="text-2xl font-bold text-gray-800">Oyun Tahtası</h3>
              </div>
              
              {settings.kingEnabled && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-gray-600"
                >
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Kral Aktif</span>
                </motion.div>
              )}
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