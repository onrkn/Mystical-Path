import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { CloudRain, Crown, HelpCircle } from 'lucide-react';
import { Switch } from './Switch';
import { playSwitchSound } from '../utils/soundUtils';
import { playButtonClickSound } from '../utils/soundUtils';
import { stopBackgroundMusic, playBackgroundMusic } from '../utils/soundUtils';
import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip';

export function GameSettings() {
  const { settings, updateSettings } = useGameStore();
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'modes' | 'sound'>('game');

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
      ...settings,
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
      ...settings,
      kingEnabled: checked 
    });
  };

  const handleDragonBossWinToggle = (checked: boolean) => {
    // Ses çal
    playSwitchSound();

    // Ayarları güncelle
    updateSettings({ 
      ...settings,
      dragonBossWinEnabled: checked 
    });
  };

  const handleMusicToggle = (checked: boolean) => {
    // Ses çal
    playSwitchSound();

    // Ayarları güncelle
    updateSettings({ 
      ...settings,
      musicEnabled: checked 
    });

    // Müziği aç/kapat
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
      ...settings,
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
            onClick={() => setActiveTab('modes')}
            className={`px-4 py-2 ${activeTab === 'modes' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500'}`}
          >
            Oyun Modları
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
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                Başlangıç Parası
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p>Oyunun başlangıcında oyunculara verilen para miktarı.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                Başlangıç Noktası Bonus
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p>Oyunun başlangıcında oyuncuların aldıkları bonus puanı.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                Arsa Fiyat Çarpanı
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p>Arsa fiyatlarının oyuna göre değişimini belirler.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                Kira Çarpanı
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p>Kira gelirlerinin oyuna göre değişimini belirler.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
          </div>
        )}

        {activeTab === 'modes' && (
          <div className="space-y-4">
            {/* Hava Durumu Sistemi */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center space-x-4">
                <CloudRain className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                    Hava Durumu Sistemi
                    <div className="relative">
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p>Hava durumu sistemi oyunun dinamikliğini artırır.</p>
                            <p>Yağmur yağdığında tüm kira gelirleri %50 düşer.</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
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

            {/* Kral Özelliği */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-100 border border-amber-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center space-x-4">
                <div className="bg-amber-500/20 p-1 rounded-full">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                    Kral Özelliği
                    <div className="relative">
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-amber-500 hover:text-amber-700 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p>Kral oyun tahtasında rastgele hareket eder.</p>
                            <p>Kralın bulunduğu mülkte kira gelirleri 10 katına çıkar!</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </h3>
                  <p className="text-xs text-amber-600">Kral oyun tahtasında hareket ediyor</p>
                </div>
              </div>
              <Switch
                checked={settings.kingEnabled}
                onCheckedChange={handleKingToggle}
                activeColor="bg-green-500"
                inactiveColor="bg-red-500"
              />
            </div>

            {/* Ejderha Boss Kazanma */}
            <div className="bg-gradient-to-r from-red-50 to-purple-100 border border-purple-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center space-x-4">
                <img src="/dragon.png" alt="Dragon" className="w-6 h-6" />
                <div>
                  <h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                    Ejderha Avcısı
                    <div className="relative">
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-purple-500 hover:text-purple-700 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p>Ejderha boss'u yendiğinizde sayaç artar.</p>
                            <p>3 ejderha öldüren oyuncu oyunu kazanır!</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </h3>
                  <p className="text-xs text-purple-600">Ejderhaları öldürerek de oyunu kazanabilirsin</p>
                </div>
              </div>
              <Switch
                checked={settings.dragonBossWinEnabled}
                onCheckedChange={handleDragonBossWinToggle}
                activeColor="bg-green-500"
                inactiveColor="bg-red-500"
              />
            </div>
          </div>
        )}

        {activeTab === 'sound' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                Müzik
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p>Oyunun arka plan müziğini açar/kapatır.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </span>
              <Switch 
                checked={settings.musicEnabled} 
                onCheckedChange={(checked) => handleMusicToggle(checked)}
                activeColor="bg-green-500"
                inactiveColor="bg-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                Ses Efektleri
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p>Oyunun ses efektlerini açar/kapatır.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </span>
              <Switch 
                checked={settings.soundEffectsEnabled} 
                onCheckedChange={(checked) => handleSoundEffectsToggle(checked)}
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