import type { Square, Boss, King } from '../types/game';

const boss: Boss = {
  id: 'dragon-1',
  name: 'Kadim Ejderha',
  strength: 5,
  rewards: {
    gold: 500,
    xp: 200,
    item: true
  }
};

export const BOARD_SIZE = 32;

export const king: King = {
  id: 'mystical_king',
  name: 'Mistik Kral',
  position: 0,
  movementInterval: 10000 // 10 saniye
};

export const squares: Square[] = [
  { id: 0, type: 'normal', name: 'Başlangıç', description: 'Başlangıç noktası' },
  { id: 1, type: 'arsa', name: 'Büyülü Orman', description: 'Satılık Arsa',
    property: { id: 1, name: 'Büyülü Orman', price: 100, rent: 20, level: 1, upgradePrice: 50, ownerId: null, baseRent: 20 }},
  { id: 2, type: 'sans', name: 'Şans', description: 'Şans kartı çek' },
  { id: 3, type: 'arsa', name: 'Kristal Mağara', description: 'Satılık Arsa',
    property: { id: 2, name: 'Kristal Mağara', price: 120, rent: 25, level: 1, upgradePrice: 50, ownerId: null, baseRent: 25 }},
  { id: 4, type: 'market', name: 'Sihirli Dükkan', description: 'Eşya satın al' },
  { id: 5, type: 'arsa', name: 'Elf Köyü', description: 'Satılık Arsa',
    property: { id: 3, name: 'Elf Köyü', price: 140, rent: 30, level: 1, upgradePrice: 50, ownerId: null, baseRent: 30 }},
  { id: 6, type: 'ceza', name: 'Ceza', description: 'Ceza kartı çek' },
  { id: 7, type: 'arsa', name: 'Ejder Yuvası', description: 'Satılık Arsa',
    property: { id: 4, name: 'Ejder Yuvası', price: 160, rent: 35, level: 1, upgradePrice: 50, ownerId: null, baseRent: 35 }},
  { id: 8, type: 'park', name: 'Sihirli Park', description: '1 tur dinlen', effect: { xp: 20 }},
  { id: 9, type: 'arsa', name: 'Unicorn Vadisi', description: 'Satılık Arsa',
    property: { id: 5, name: 'Unicorn Vadisi', price: 180, rent: 40, level: 1, upgradePrice: 50, ownerId: null, baseRent: 40 }},
  { id: 10, type: 'bonus', name: 'Hazine', description: 'Bonus kazan!', effect: { coins: 50, xp: 20 }},
  { id: 11, type: 'arsa', name: 'Sihirli Göl', description: 'Satılık Arsa',
    property: { id: 6, name: 'Sihirli Göl', price: 200, rent: 45, level: 1, upgradePrice: 50, ownerId: null, baseRent: 45 }},
  { id: 12, type: 'sans', name: 'Şans', description: 'Şans kartı çek' },
  { id: 13, type: 'arsa', name: 'Peri Bahçesi', description: 'Satılık Arsa',
    property: { id: 7, name: 'Peri Bahçesi', price: 220, rent: 50, level: 1, upgradePrice: 50, ownerId: null, baseRent: 50 }},
  { id: 14, type: 'market', name: 'Sihirli Dükkan', description: 'Eşya satın al' },
  { id: 15, type: 'arsa', name: 'Büyücü Kulesi', description: 'Satılık Arsa',
    property: { id: 8, name: 'Büyücü Kulesi', price: 240, rent: 55, level: 1, upgradePrice: 50, ownerId: null, baseRent: 55 }},
  { id: 16, type: 'boss', name: 'Ejderha Savaşı', description: 'Ejderha ile savaş!', boss },
  { id: 17, type: 'arsa', name: 'Antik Tapınak', description: 'Satılık Arsa',
    property: { id: 9, name: 'Antik Tapınak', price: 260, rent: 60, level: 1, upgradePrice: 50, ownerId: null, baseRent: 60 }},
  { id: 18, type: 'ceza', name: 'Ceza', description: 'Ceza kartı çek' },
  { id: 19, type: 'arsa', name: 'Deniz Feneri', description: 'Satılık Arsa',
    property: { id: 10, name: 'Deniz Feneri', price: 280, rent: 65, level: 1, upgradePrice: 50, ownerId: null, baseRent: 65 }},
  { id: 20, type: 'sans', name: 'Şans', description: 'Şans kartı çek' },
  { id: 21, type: 'arsa', name: 'Gökkuşağı Köprüsü', description: 'Satılık Arsa',
    property: { id: 11, name: 'Gökkuşağı Köprüsü', price: 300, rent: 70, level: 1, upgradePrice: 50, ownerId: null, baseRent: 70 }},
  { id: 22, type: 'market', name: 'Sihirli Dükkan', description: 'Eşya satın al' },
  { id: 23, type: 'arsa', name: 'Ay Sarayı', description: 'Satılık Arsa',
    property: { id: 12, name: 'Ay Sarayı', price: 320, rent: 75, level: 1, upgradePrice: 50, ownerId: null, baseRent: 75 }},
  { id: 24, type: 'park', name: 'Sihirli Park', description: '1 tur dinlen', effect: { xp: 20 }},
  { id: 25, type: 'arsa', name: 'Yıldız Kalesi', description: 'Satılık Arsa',
    property: { id: 13, name: 'Yıldız Kalesi', price: 340, rent: 80, level: 1, upgradePrice: 50, ownerId: null, baseRent: 80 }},
  { id: 26, type: 'bonus', name: 'Hazine', description: 'Bonus kazan!', effect: { coins: 100, xp: 40 }},
  { id: 27, type: 'arsa', name: 'Gökyüzü Kulesi', description: 'Satılık Arsa',
    property: { id: 14, name: 'Gökyüzü Kulesi', price: 360, rent: 85, level: 1, upgradePrice: 50, ownerId: null, baseRent: 85 }},
  { id: 28, type: 'ceza', name: 'Ceza', description: 'Ceza kartı çek' },
  { id: 29, type: 'arsa', name: 'Kristal Saray', description: 'Satılık Arsa',
    property: { id: 15, name: 'Kristal Saray', price: 400, rent: 100, level: 1, upgradePrice: 50, ownerId: null, baseRent: 100 }},
  { id: 30, type: 'market', name: 'Sihirli Dükkan', description: 'Eşya satın al' },
  { id: 31, type: 'boss', name: 'Ejderha Savaşı', description: 'Ejderha ile savaş!', boss }
];