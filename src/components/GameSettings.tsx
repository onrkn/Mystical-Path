import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { CloudRain } from './icons/CloudRain';
import { Switch } from './Switch';
import { HelpCircle } from './icons/HelpCircle';
import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip';
import { playSwitchSound } from '../utils/soundUtils';
import { playButtonClickSound } from '../utils/soundUtils';
import { stopBackgroundMusic, playBackgroundMusic } from '../utils/soundUtils';

export function GameSettings() {
  const { settings, updateSettings } = useGameStore();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'sound'>('game');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Switch'e tıklandığında ses çal
    if (type === 'checkbox') {
      playSwitchSound();
    }
    
    updateSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : Number(value),
    });
  };

  const handleWeatherToggle = (checked: boolean) => {
    // Ses çal
    playSwitchSound();

    // Ayarları güncelle
    updateSettings({ 
      weatherEnabled: checked 
    });

    // Eğer kapatılırsa mevcut yağmuru durdur
    if (!checked) {
      useGameStore.getState().updateWeather('none');
    }
  };

  const handleKingToggle = (checked: boolean) => {
    // Ses çal
    playSwitchSound();

    // Ayarları güncelle
    updateSettings({ 
      kingEnabled: checked 
    });
  };

  const handleMusicToggle = (checked: boolean) => {
    // Ses çal
    playSwitchSound();

    // Ayarları güncelle
    updateSettings({ 
      musicEnabled: checked 
    });

    // Müzik ayarını değiştir
    if (checked) {
      playBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  };

  const handleSoundEffectsToggle = (checked: boolean) => {
    // Ses çal
    playSwitchSound();

    // Ayarları güncelle
    updateSettings({ 
      soundEffectsEnabled: checked 
    });
  };

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation(); // Tıklamanın yayılmasını engelle
    setIsTooltipVisible(!isTooltipVisible);
  };

  const handleSaveAndClose = () => {
    // Buton tıklama sesi
    playButtonClickSound();
    
    // Ayarları kaydet ve pencereyi kapat
    useGameStore.setState({ showSettings: false });
  };

  // Dışarı tıklandığında tooltip'i kapat
  useEffect(() => {
    const handleClickOutside = () => setIsTooltipVisible(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Oyun Ayarları</h2>
        
        {/* Tab Menüsü */}
        <div className="flex mb-4 border-b">
          <button 
            onClick={() => setActiveTab('game')}
            className={`px-4 py-2 ${activeTab === 'game' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500'}`}
          >
            Oyun Ayarları
          </button>
          <button 
            onClick={() => setActiveTab('sound')}
            className={`px-4 py-2 ${activeTab === 'sound' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500'}`}
          >
            Ses Ayarları
          </button>
        </div>

        {activeTab === 'game' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Başlangıç Parası
              </label>
              <input
                type="number"
                value={settings.startingMoney}
                onChange={(e) => handleChange(e)}
                name="startingMoney"
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
                onChange={(e) => handleChange(e)}
                name="passingStartBonus"
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
                onChange={(e) => handleChange(e)}
                name="propertyPriceMultiplier"
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
                onChange={(e) => handleChange(e)}
                name="propertyRentMultiplier"
                min={0.5}
                max={2}
                step={0.1}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center space-x-4">
                <CloudRain className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-800 flex items-center">
                    Hava Durumu Sistemi
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 ml-2 text-blue-500 hover:text-blue-700" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Hava durumu sistemi oyunun dinamikliğini artırır.</p>
                        <p>Yağmur yağdığında tüm kira gelirleri %50 düşer.</p>
                        <p>Açık/kapalı olarak ayarlayabilirsiniz.</p>
                      </TooltipContent>
                    </Tooltip>
                  </h3>
                  <p className="text-xs text-blue-600">Oyunun hava koşullarını kontrol et</p>
                </div>
              </div>
              <Switch
                checked={settings.weatherEnabled}
                onCheckedChange={handleWeatherToggle}
                activeColor="bg-green-500"
                inactiveColor="bg-red-500"
              />
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <span>Kral Özelliği</span>
                    <div className="relative">
                      <span 
                        className="cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={toggleTooltip}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {isTooltipVisible && (
                        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg shadow-lg p-3 transition-all duration-300">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              className="w-5 h-5 text-yellow-400"
                              fill="currentColor"
                            >
                              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11z"/>
                            </svg>
                            <span className="font-bold">Kral Özelliği</span>
                          </div>
                          <p>
                            Oyun tahtasında rastgele hareket eden kral, bulunduğu mülkte 
                            kira gelirini 10 katına çıkarır! Stratejik bir unsur olarak 
                            oyuna heyecan katar.
                          </p>
                        </div>
                      )}
                    </div>
                    <span 
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        settings.kingEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {settings.kingEnabled ? 'Aktif' : 'Pasif'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    {settings.kingEnabled 
                      ? "Kral oyun tahtasında hareket ediyor" 
                      : "Kral oyun dışı"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.kingEnabled}
                onCheckedChange={handleKingToggle}
                activeColor="bg-green-500"
                inactiveColor="bg-red-500"
              />
            </div>

            {activeTab === 'sound' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Müzik</span>
                  <Switch 
                    checked={settings.musicEnabled} 
                    onCheckedChange={handleMusicToggle}
                    activeColor="bg-green-500"
                    inactiveColor="bg-red-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Ses Efektleri</span>
                  <Switch 
                    checked={settings.soundEffectsEnabled} 
                    onCheckedChange={handleSoundEffectsToggle}
                    activeColor="bg-green-500"
                    inactiveColor="bg-red-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sound' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Müzik</span>
              <Switch 
                checked={settings.musicEnabled} 
                onCheckedChange={handleMusicToggle}
                activeColor="bg-green-500"
                inactiveColor="bg-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Ses Efektleri</span>
              <Switch 
                checked={settings.soundEffectsEnabled} 
                onCheckedChange={handleSoundEffectsToggle}
                activeColor="bg-green-500"
                inactiveColor="bg-red-500"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSaveAndClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
}