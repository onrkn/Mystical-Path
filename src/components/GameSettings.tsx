import React from 'react';
import type { GameSettings } from '../types/game';

interface GameSettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onClose: () => void;
}

export function GameSettings({ settings, onSettingsChange, onClose }: GameSettingsProps) {
  const handleChange = (key: keyof GameSettings, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Oyun Ayarları</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Başlangıç Parası
            </label>
            <input
              type="number"
              value={settings.startingMoney}
              onChange={(e) => handleChange('startingMoney', Number(e.target.value))}
              min={100}
              step={50}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Başlangıç Noktası Bonus
            </label>
            <input
              type="number"
              value={settings.passingStartBonus}
              onChange={(e) => handleChange('passingStartBonus', Number(e.target.value))}
              min={0}
              step={50}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Arsa Fiyat Çarpanı
            </label>
            <input
              type="number"
              value={settings.propertyPriceMultiplier}
              onChange={(e) => handleChange('propertyPriceMultiplier', Number(e.target.value))}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Kira Çarpanı
            </label>
            <input
              type="number"
              value={settings.propertyRentMultiplier}
              onChange={(e) => handleChange('propertyRentMultiplier', Number(e.target.value))}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
}