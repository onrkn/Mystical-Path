import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function GameLog() {
  const gameLog = useGameStore(state => state.gameLog);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [gameLog]);

  if (!gameLog) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold mb-2">Oyun Geçmişi</h3>
      <div 
        ref={logContainerRef}
        className="h-48 overflow-y-auto space-y-1"
      >
        {gameLog.map((entry, index) => (
          <p 
            key={index} 
            className="text-sm border-b border-gray-100 py-1"
            dangerouslySetInnerHTML={{ __html: entry }}
          />
        ))}
      </div>
    </div>
  );
}