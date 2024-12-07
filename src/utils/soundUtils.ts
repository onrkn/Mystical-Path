import { Howl } from 'howler';
import { useGameStore } from '../store/gameStore';

export const SOUND_EFFECTS = {
  DICE_ROLL: '/sounds/dice-roll.mp3',
  SWITCH: '/sounds/switch.mp3',
  BUTTON_CLICK: '/sounds/button-click.mp3',
  PURCHASE: '/sounds/purchase.mp3',
  MAGIC_SHOP_PURCHASE: '/sounds/magic-shop-purchase.mp3', 
  // Diğer ses efektleri buraya eklenebilir
};

export const MUSIC_TRACKS = {
  THEME: '/sounds/theme-music.mp3'
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
  // Ses efektleri ayarı kapalıysa çalma
  const soundEffectsEnabled = useGameStore.getState().settings.soundEffectsEnabled;
  if (!soundEffectsEnabled) return;

  console.log('Playing sound effect:', soundName);

  const sound = new Howl({
    src: [soundName],
    html5: false, // Web Audio API kullan
    volume: volume,
    format: ['mp3'],
    onload: () => console.log('Sound loaded successfully'),
    onloaderror: (id, err) => {
      console.error('Sound load error:', err);
      console.error('Sound path:', soundName);
    },
    onplayerror: (id, err) => console.error('Sound play error:', err)
  });

  sound.once('load', () => {
    sound.play();
  });
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
