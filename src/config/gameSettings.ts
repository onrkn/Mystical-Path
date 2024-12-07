import type { GameSettings } from '../types/game';

export const defaultSettings: GameSettings = {
  startingMoney: 1000,
  passingStartBonus: 100,
  propertyPriceMultiplier: 1,
  propertyRentMultiplier: 1,
  kingEnabled: false,
  weatherEnabled: true,
  botDifficulty: 'normal',
  soundEnabled: true,
  musicVolume: 50,
  sfxVolume: 50
};