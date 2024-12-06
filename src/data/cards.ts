import { Card } from '../types/game';

export const sansKartlari: Card[] = [
  {
    id: 1,
    type: 'sans',
    title: 'Piyango',
    description: 'Tebrikler! Piyango kazandınız!',
    effect: { coins: 50, xp: 20 }
  },
  {
    id: 2,
    type: 'sans',
    title: 'Hazine Sandığı',
    description: 'Antik bir hazine sandığı buldunuz!',
    effect: { coins: 30, score: 15, xp: 25 }
  },
  {
    id: 3,
    type: 'sans',
    title: 'Büyücü Hediyesi',
    description: 'Büyücü size altın hediye etti!',
    effect: { coins: 75, xp: 15 }
  },
  {
    id: 4,
    type: 'sans',
    title: 'Bilge Büyücü',
    description: 'Büyücü size yeni büyüler öğretti!',
    effect: { score: 25, xp: 30 }
  }
];

export const cezaKartlari: Card[] = [
  {
    id: 1,
    type: 'ceza',
    title: 'Vergi Borcu',
    description: 'Krallığa vergi ödemeniz gerekiyor!',
    effect: { coins: -25 },
    chance: 25
  },
  {
    id: 2,
    type: 'ceza',
    title: 'Ejderha Saldırısı',
    description: 'Ejderha hazinelerinizi çaldı!',
    effect: { coins: -40, score: -10 },
    chance: 25
  },
  {
    id: 3,
    type: 'ceza',
    title: 'Büyü Kazası',
    description: 'Yanlış büyü size zarar verdi!',
    effect: { coins: -35, xp: -10 },
    chance: 25
  },
  {
    id: 4,
    type: 'ceza',
    title: 'Hırsız',
    description: 'Bir hırsız paranızı çaldı!',
    effect: { coins: -30 },
    chance: 25
  }
];