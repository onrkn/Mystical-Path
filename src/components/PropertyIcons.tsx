import React from 'react';

export const PropertyIcons = {
  'Büyülü Orman': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/forest.png)' }}
    />
  ),
  'Kristal Mağara': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/cave.png)' }}
    />
  ),
  'Elf Köyü': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/village.png)' }}
    />
  ),
  'Ejder Yuvası': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/nest.png)' }}
    />
  ),
  'Unicorn Vadisi': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/valley-of-the-kings.png)' }}
    />
  ),
  'Sihirli Göl': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/lake.png)' }}
    />
  ),
  'Hatiş\'in Bahçesi': () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-pink-500">
      <path d="M12 3L16 7L12 11L8 7L12 3Z" />
      <path d="M8 11L12 15L16 11" />
      <path d="M12 15V21" />
    </svg>
  ),
  'Büyücü Kulesi': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/rapunzel-tower.png)' }}
    />
  ),
  'Gökkuşağı Köprüsü': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/rainbow.png)' }}
    />
  ),
  'Ay Sarayı': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/mosque.png)' }}
    />
  ),
  'Deniz Feneri': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/lighthouse.png)' }}
    />
  ),
  'Yıldız Kalesi': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/haunted-castle.png)' }}
    />
  ),
  'Gökyüzü Kulesi': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/tower-of-babel.png)' }}
    />
  ),
  'Kristal Saray': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/kristalsaray.png)' }}
    />
  ),
  'Antik Tapınak': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/src/assets/temple.png)' }}
    />
  )
};

export const getPropertyIcon = (propertyName: string) => {
  const IconComponent = PropertyIcons[propertyName];
  return IconComponent ? <IconComponent /> : null;
};
