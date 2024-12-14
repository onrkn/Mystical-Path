import React, { useEffect, useState } from 'react';
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
import { CombatAnimation } from './components/CombatAnimation';
import { SlotMachine } from './components/SlotMachine';
import { useGameStore } from './store/gameStore';
import { playBackgroundMusic, stopBackgroundMusic } from './utils/soundUtils';
import { playButtonClickSound } from './utils/soundUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Settings, 
  Users, 
  Wand2, 
  Sparkles, 
  Cloud 
} from 'lucide-react';
import './styles/background.css';

function MagicBackground() {
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 50 }, (_, index) => {
        const size = Math.random() * 10 + 2;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 5;

        return (
          <div 
            key={index} 
            className={`magical-${Math.random() > 0.5 ? 'particle' : 'sparkle'}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `-${delay}s`,
              animationDuration: `${duration}s`
            }}
          />
        );
      });

      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="magic-background">
      {particles}
      {Array.from({ length: 10 }, (_, index) => (
        <div 
          key={`floating-${index}`}
          className="floating-element"
          style={{
            width: `${Math.random() * 200 + 50}px`,
            height: `${Math.random() * 200 + 50}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`
          }}
        />
      ))}
      {Array.from({ length: 5 }, (_, index) => (
        <div 
          key={`spinning-${index}`}
          className="spinning-element"
          style={{
            width: `${Math.random() * 300 + 100}px`,
            height: `${Math.random() * 300 + 100}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`
          }}
        />
      ))}
    </div>
  );
}

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
    startWeatherSystem,
    activeBoss,
    showSlotMachine,
    slotMachinePlayerId,
    closeSlotMachine
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
    <>
      <MagicBackground />
      <div className="min-h-screen relative z-10 bg-transparent">
        <WeatherEffect type={weather} />
        <Notification />
        {gameStarted && <WeatherIndicator />}
        {showCombatAnimation?.visible && (
          <div>
            {console.log('CombatAnimation props:', {
              isVisible: showCombatAnimation.visible,
              won: showCombatAnimation.won,
              reward: showCombatAnimation.reward
            })}
            <CombatAnimation
              isVisible={showCombatAnimation.visible}
              won={showCombatAnimation.won}
              reward={showCombatAnimation.reward}
            />
          </div>
        )}
        <header className="bg-gradient-to-r from-purple-800 to-blue-900 text-white py-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-blue-950 opacity-20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center space-x-4"
            >
              <Wand2 className="w-12 h-12 text-yellow-300" />
              <h1 className="text-4xl font-extrabold text-center tracking-tight">
                Mystical Path
              </h1>
              <Sparkles className="w-10 h-10 text-yellow-300" />
            </motion.div>
            <p className="text-center mt-3 text-blue-100 flex items-center justify-center space-x-2">
              <Cloud className="w-5 h-5 opacity-70" />
              <span>Büyülü bir strateji oyunu V1.3</span>
              <Cloud className="w-5 h-5 opacity-70" />
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 pb-8">
          <AnimatePresence>
            {!gameStarted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 max-w-xl mx-auto"
              >
                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <PlayerSetup />
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playButtonClickSound();
                    useGameStore.setState({ showSettings: true });
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Settings className="w-6 h-6" />
                  <span>Oyun Ayarları</span>
                </motion.button>
              </motion.div>
            ) : (
              <GameBoard />
            )}
          </AnimatePresence>

          {showSettings && <GameSettings />}
          {showBossDialog && activeBoss && (
            <BossBattle boss={activeBoss} />
          )}
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
          {showSlotMachine && slotMachinePlayerId && (
            <SlotMachine
              onClose={closeSlotMachine}
              playerId={slotMachinePlayerId}
            />
          )}
        </main>
      </div>
    </>
  );
}