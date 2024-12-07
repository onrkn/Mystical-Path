import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeatherEffectProps {
  type: 'rain' | 'none';
}

export function WeatherEffect({ type }: WeatherEffectProps) {
  if (type !== 'rain') return null;

  // Yağmur damlası sayısını artır
  const raindrops = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: 0.5 + Math.random() * 0.5, // Düşme hızı çeşitliliği
    size: 1 + Math.random() * 2, // Damla boyutu çeşitliliği
    opacity: 0.3 + Math.random() * 0.4, // Opaklık çeşitliliği
  }));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50">
        {raindrops.map((drop) => (
          <motion.div
            key={drop.id}
            initial={{ 
              top: "-2%", 
              left: drop.left,
              opacity: 0 
            }}
            animate={{ 
              top: "100%",
              opacity: drop.opacity
            }}
            transition={{
              duration: drop.duration,
              repeat: Infinity,
              delay: drop.delay,
              ease: "linear"
            }}
            style={{
              position: "absolute",
              width: `${drop.size}px`,
              height: `${drop.size * 15}px`, // Daha uzun damlalar
              background: "linear-gradient(180deg, rgba(148,187,233,0.8) 0%, rgba(148,187,233,0) 100%)",
              borderRadius: "2px",
              filter: "blur(1px)", // Hafif bulanıklık efekti
              boxShadow: "0 0 2px rgba(148,187,233,0.5)" // Parlama efekti
            }}
          />
        ))}
        {/* Arka plan efekti */}
        <div 
          className="absolute inset-0" 
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)",
            pointerEvents: "none"
          }}
        />
      </div>
    </AnimatePresence>
  );
}
