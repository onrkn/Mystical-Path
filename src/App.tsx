import React from 'react';
import { PlayerSetup } from './components/PlayerSetup';
import { GameBoard } from './components/GameBoard';
import { GameSettings } from './components/GameSettings';
import { BossBattle } from './components/BossBattle';
import { Market } from './components/Market';
import { useGameStore } from './store/gameStore';

export default function App() {
  const { 
    gameStarted,
    showSettings,
    showBossDialog,
    showMarketDialog,
    players,
    settings
  } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-6 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">Mystical Path</h1>
          <p className="text-center mt-2 text-blue-100">
            Büyülü bir strateji oyunu V1.0.1
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        {!gameStarted ? (
          <div className="space-y-4">
            <PlayerSetup />
            <button
              onClick={() => useGameStore.setState({ showSettings: true })}
              className="w-full max-w-md mx-auto block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Oyun Ayarları
            </button>
          </div>
        ) : (
          <GameBoard />
        )}

        {showSettings && <GameSettings />}
        {showBossDialog && <BossBattle />}
        {showMarketDialog && <Market />}
      </main>
    </div>
  );
}