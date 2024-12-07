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

  // Ses efekti zaten yüklüyse, direkt çal
  if (soundCache[soundPath]) {
    try {
      // Önce mevcut sesi durdur ve kaldır
      soundCache[soundPath].stop();
      soundCache[soundPath].unload();
      delete soundCache[soundPath];
    } catch (error) {
      console.error('Önbellek temizleme hatası:', error);
    }
  }

  // Yeni ses efekti oluştur
  try {
    const sound = new Howl({
      src: [soundPath],
      html5: true, // HTML5 Audio kullan
      volume: volume,
      preload: true, // Otomatik preload
      onload: () => {
        console.log('Ses başarıyla yüklendi');
        sound.play();
      },
      onloaderror: (id, err) => {
        console.error('Ses yükleme hatası:', err);
        console.error('Ses yolu:', soundPath);
      },
      onplayerror: (id, err) => {
        console.error('Ses çalma hatası:', err);
        sound.unload(); // Hata durumunda sesi kaldır
      },
      onend: () => {
        console.log('Ses çalma tamamlandı');
        sound.unload(); // Çalma bitince sesi kaldır
      }
    });

    // Cache'e ekle
    soundCache[soundPath] = sound;
  } catch (error) {
    console.error('Ses oluşturma hatası:', error);
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
    volume: 0.1,  
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
