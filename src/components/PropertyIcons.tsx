import React from 'react';

export const PropertyIcons = {
  'Büyülü Orman': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/forest.png)' }}
    />
  ),
  'Kristal Mağara': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/cave.png)' }}
    />
  ),
  'Elf Köyü': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/village.png)' }}
    />
  ),
  'Ejder Yuvası': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/nest.png)' }}
    />
  ),
  'Unicorn Vadisi': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/valley-of-the-kings.png)' }}
    />
  ),
  'Sihirli Göl': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/lake.png)' }}
    />
  ),
  'Hatiş\'in Bahçesi': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/hatis.png)' }}
    />
  ),
  'Büyücü Kulesi': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/rapunzel-tower.png)' }}
    />
  ),
  'Gökkuşağı Köprüsü': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/rainbow.png)' }}
    />
  ),
  'Ay Sarayı': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/mosque.png)' }}
    />
  ),
  'Deniz Feneri': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/lighthouse.png)' }}
    />
  ),
  'Yıldız Kalesi': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/haunted-castle.png)' }}
    />
  ),
  'Gökyüzü Kulesi': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/tower-of-babel.png)' }}
    />
  ),
  'Kristal Saray': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/kristalsaray.png)' }}
    />
  ),
  'Ejderha Savaşı': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/dragon.png)' }}
    />
  ),
  'Antik Tapınak': () => (
    <div 
      className="w-6 h-6 bg-contain bg-center bg-no-repeat mix-blend-multiply"
      style={{ backgroundImage: 'url(/assets/temple.png)' }}
    />
  )
};

export const getPropertyIcon = (propertyName: string) => {
  const IconComponent = PropertyIcons[propertyName];
  return IconComponent ? <IconComponent /> : null;
};
