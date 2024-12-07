import React from 'react';
import { Cloud, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function WeatherIndicator() {
  const { weather, settings } = useGameStore();
  
  // Hava durumu ayarı kapalıysa null döndür
  if (!settings.weatherEnabled) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={weather}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
            ${weather === 'rain' 
              ? 'bg-blue-500 text-white' 
              : 'bg-yellow-500 text-white'
            }
          `}
        >
          {weather === 'rain' ? (
            <>
              <Cloud className="w-5 h-5" />
              <span className="font-medium">Yağmurlu (-50% Kira)</span>
            </>
          ) : (
            <>
              <Sun className="w-5 h-5" />
              <span className="font-medium">Güneşli</span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
