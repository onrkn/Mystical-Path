import React, { useEffect } from 'react';
import { PlayerSetup } from './components/PlayerSetup';
import { GameSettings } from './components/GameSettings';
import { GameBoard } from './components/GameBoard';
import { BossBattle } from './components/BossBattle';
import { Market } from './components/Market';
import { PropertyDialog } from './components/PropertyDialog';
import { AllianceDialog } from './components/AllianceDialog';
import { RentPaymentDialog } from './components/RentPaymentDialog';
import { BankruptcyDialog } from './components/BankruptcyDialog';
import { Notification } from './components/Notification';
import { WeatherEffect } from './components/WeatherEffect';
import { WeatherIndicator } from './components/WeatherIndicator';
import { useGameStore } from './store/gameStore';
import { playBackgroundMusic, stopBackgroundMusic } from './utils/soundUtils';
import { playButtonClickSound } from './utils/soundUtils';

export default function App() {
  const { 
    gameStarted, 
    showSettings,
    showBossDialog,
    showMarketDialog,
    showPropertyDialog,
    showAllianceDialog,
    showRentDialog,
    showBankruptcyDialog,
    showCombatAnimation,
    selectedProperty,
    rentInfo,
    bankruptPlayer,
    players,
    settings,
    weather,
    startWeatherSystem 
  } = useGameStore();

  useEffect(() => {
    // Oyun başladığında müziği çal
    if (gameStarted) {
      try {
        console.log('Oyun başladı, müzik çalınacak');
        
        // Müzik ayarı açıksa müziği çal
        if (settings.musicEnabled) {
          const musicInstance = playBackgroundMusic();
          
          // Müziğin gerçekten çalıp çalmadığını kontrol et
          if (musicInstance) {
            musicInstance.on('play', () => {
              console.log('Müzik başarıyla çalıyor');
            });
            
            musicInstance.on('loaderror', (id, err) => {
              console.error('Müzik yükleme hatası:', err);
            });
            
            musicInstance.on('playerror', (id, err) => {
              console.error('Müzik çalma hatası:', err);
            });
          }
        }
      } catch (error) {
        console.error('Müzik çalınırken genel hata:', error);
      }
    }

    // Oyun başladığında ve ayarlar değiştiğinde weather sistemini başlat
    useGameStore.getState().initializeWeatherSystem();

    const unsubscribe = useGameStore.subscribe(
      (state) => state.settings.weatherEnabled,
      (weatherEnabled) => {
        if (weatherEnabled) {
          useGameStore.getState().startWeatherSystem();
        } else {
          useGameStore.getState().stopWeatherSystem();
          useGameStore.getState().updateWeather('none');
        }
      }
    );

    return () => {
      unsubscribe();
      useGameStore.getState().stopWeatherSystem();
      stopBackgroundMusic(); // Müziği durdur
    };
  }, [gameStarted, settings.musicEnabled]);

  return (
    <div className="min-h-screen bg-gray-100">
      <WeatherEffect type={weather} />
      <Notification />
      {gameStarted && <WeatherIndicator />}
      {showCombatAnimation?.visible && (
        <CombatAnimation
          isVisible={showCombatAnimation.visible}
          won={showCombatAnimation.won}
          reward={showCombatAnimation.reward}
        />
      )}
      <header className="bg-gradient-to-r from-purple-800 to-blue-900 text-white py-6 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">Mystical Path</h1>
          <p className="text-center mt-2 text-blue-100">
            Büyülü bir strateji oyunu V1.1.0
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-8">
        {!gameStarted ? (
          <div className="space-y-4">
            <PlayerSetup />
            <button
              onClick={() => {
                playButtonClickSound(); // Buton tıklama sesi
                useGameStore.setState({ showSettings: true });
              }}
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
        {showPropertyDialog && selectedProperty && <PropertyDialog property={selectedProperty} />}
        {showAllianceDialog && (
          <AllianceDialog onClose={() => useGameStore.setState({ showAllianceDialog: false })} />
        )}
        {showRentDialog && rentInfo && (
          <RentPaymentDialog
            property={rentInfo.property}
            owner={rentInfo.owner}
            player={rentInfo.player}
          />
        )}
        {showBankruptcyDialog && bankruptPlayer && (
          <BankruptcyDialog
            playerName={bankruptPlayer.name}
            onClose={() => useGameStore.setState({ showBankruptcyDialog: false })}
          />
        )}
      </main>
    </div>
  );
}