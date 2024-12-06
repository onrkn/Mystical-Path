import React, { useEffect } from 'react';
import { BoardSquare } from './BoardSquare';
import { PlayerStats } from './PlayerStats';
import { GameLog } from './GameLog';
import { DiceRoller } from './DiceRoller';
import { Inventory } from './Inventory';
import { squares, king, BOARD_SIZE } from '../data/board';
import { useGameStore } from '../store/gameStore';

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <PlayerStats />
          <Inventory />
          <GameLog />
        </div>
        
        <div className="lg:col-span-2 relative">
          <DiceRoller />
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Oyun Tahtası</h3>
            <div className="grid grid-cols-8 gap-2 relative">
              {squares.map((square, index) => (
                <BoardSquare
                  key={square.id}
                  square={square}
                  players={players.filter(p => p.position === index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}