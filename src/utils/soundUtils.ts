import { Howl } from 'howler';
import { useGameStore } from '../store/gameStore';

// Ses efektlerini saklamak için cache
const soundCache: { [key: string]: Howl } = {};

export const SOUND_EFFECTS = {
  DICE_ROLL: '/sounds/dice-roll.mp3',
  SWITCH: '/sounds/switch.mp3',
  BUTTON_CLICK: '/sounds/button-click.mp3',
  PURCHASE: '/sounds/purchase.mp3',
  MAGIC_SHOP_PURCHASE: '/sounds/magic-shop-purchase.mp3',
  // Diğer ses efektleri buraya eklenebilir
};

// Ses önbelleğini temizle
export function clearSoundCache() {
  Object.values(soundCache).forEach(sound => {
    try {
      sound.unload();
    } catch (error) {
      console.error('Ses önbelleği temizlenirken hata:', error);
    }
  });
  
  // Önbelleği sıfırla
  Object.keys(soundCache).forEach(key => {
    delete soundCache[key];
  });
}

// Ses efektini yükle ve çal
function loadAndPlaySound(soundPath: string, volume: number = 0.5): void {
  // Ses efektleri ayarı kapalıysa çalma
  const soundEffectsEnabled = useGameStore.getState().settings.soundEffectsEnabled;
  if (!soundEffectsEnabled) return;

  console.log('Ses çalınmaya çalışılıyor:', soundPath);

  try {
    // Ses efekti zaten yüklüyse ve çalışıyorsa, tekrar kullan
    if (soundCache[soundPath] && soundCache[soundPath].state() === 'loaded') {
      soundCache[soundPath].volume(volume);
      soundCache[soundPath].play();
      return;
    }

    // Yeni ses efekti oluştur
    const sound = new Howl({
      src: [soundPath],
      html5: true,
      volume: volume,
      preload: true,
      format: ['mp3'],
      pool: 5,
      onload: () => {
        console.log('Ses başarıyla yüklendi:', soundPath);
        sound.play();
      },
      onloaderror: (id, err) => {
        console.error('Ses yükleme hatası:', err);
        // Hata durumunda önbellekten kaldır
        delete soundCache[soundPath];
      },
      onplayerror: () => {
        console.error('Ses çalma hatası');
        sound.once('unlock', () => {
          sound.play();
        });
      },
      onend: () => {
        // Ses bittiğinde önbellekten kaldırma, tekrar kullanılabilir
        console.log('Ses çalma tamamlandı:', soundPath);
      }
    });

    // Cache'e ekle
    soundCache[soundPath] = sound;
  } catch (error) {
    console.error('Ses işleme hatası:', error);
  }
}

export const MUSIC_TRACKS = {
  THEME: '/sounds/theme-music.mp3',
  BOSS_BATTLE: '/sounds/boss-battle-music.mp3' // Yeni ejderha savaş müziği
};

let backgroundMusicInstance: Howl | null = null;

export function playBackgroundMusic() {
  // Müzik ayarı kapalıysa çalma
  const musicEnabled = useGameStore.getState().settings.musicEnabled;
  const isMarketOpen = useGameStore.getState().showMarketDialog;
  
  // Market açıksa tema müziğini çalma
  if (isMarketOpen) return null;

  if (!musicEnabled) return null;

  // Eğer zaten çalan bir müzik varsa durdur
  if (backgroundMusicInstance) {
    backgroundMusicInstance.stop();
    backgroundMusicInstance.unload();
  }

  console.log('Müzik çalınmaya çalışılıyor:', MUSIC_TRACKS.THEME);
  
  backgroundMusicInstance = new Howl({
    src: [MUSIC_TRACKS.THEME],
    html5: true,
    preload: true, // Otomatik preload'u aç
    loop: true,
    volume: 0.05,  
    onload: () => {
      console.log('Müzik başarıyla yüklendi');
      backgroundMusicInstance?.play();
    },
    onplay: () => {
      console.log('Müzik çalıyor');
    },
    onloaderror: (id, err) => {
      console.error('Müzik yüklenirken HATA:', err, 'Müzik yolu:', MUSIC_TRACKS.THEME);
      // Hata durumunda müzik örneğini temizle
      if (backgroundMusicInstance) {
        backgroundMusicInstance.unload();
        backgroundMusicInstance = null;
      }
    },
    onplayerror: (id, err) => {
      console.error('Müzik çalınırken HATA:', err);
      // Hata durumunda müzik örneğini temizle
      if (backgroundMusicInstance) {
        backgroundMusicInstance.stop();
        backgroundMusicInstance.unload();
        backgroundMusicInstance = null;
      }
    }
  });

  return backgroundMusicInstance;
}

export function stopBackgroundMusic() {
  if (backgroundMusicInstance) {
    backgroundMusicInstance.stop();
    backgroundMusicInstance.unload();
    backgroundMusicInstance = null;
  }
}

export const MARKET_MUSIC = new Howl({
  src: ['/sounds/market-music.mp3'],
  html5: true,
  loop: true,
  volume: 0.3,
  preload: true,
  format: ['mp3'],
  onloaderror: (id, err) => {
    console.error('Market müziği yükleme hatası:', err);
  }
});

export function stopMarketMusic() {
  MARKET_MUSIC.stop();
}

export function playMarketMusic() {
  const soundEnabled = useGameStore.getState().settings.soundEffectsEnabled;
  if (!soundEnabled) return;
  MARKET_MUSIC.play();
}

export function playSoundEffect(soundName: string, volume: number = 0.5) {
  // Her ses çalma işleminden önce önbelleği temizle
  clearSoundCache();
  loadAndPlaySound(soundName, volume);
}

export function playSwitchSound() {
  playSoundEffect(SOUND_EFFECTS.SWITCH, 0.3);
}

export function playButtonClickSound() {
  playSoundEffect(SOUND_EFFECTS.BUTTON_CLICK, 0.3);
}

export function playPurchaseSound() {
  playSoundEffect(SOUND_EFFECTS.PURCHASE, 0.3);
}

export function playMagicShopPurchaseSound() {
  playSoundEffect(SOUND_EFFECTS.MAGIC_SHOP_PURCHASE, 0.3);
}
