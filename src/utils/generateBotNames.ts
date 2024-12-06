const turkishMaleNames = [
  'Ahmet', 'Mehmet', 'Ali', 'Mustafa', 'Hüseyin', 'İbrahim', 'Hasan', 
  'Emre', 'Yusuf', 'Eren', 'Kemal', 'Osman', 'Serdar', 'Murat', 
  'Furkan', 'Burak', 'Caner', 'Arda', 'Onur', 'Barış'
];

const turkishFemaleNames = [
  'Ayşe', 'Fatma', 'Elif', 'Zeynep', 'Merve', 'Esra', 'Selin', 
  'Büşra', 'Gizem', 'Derya', 'Pınar', 'Ceren', 'Ece', 'Neslihan', 
  'Damla', 'Yasemin', 'Şebnem', 'Çiğdem', 'Aslı', 'Tuğba'
];

export function generateTurkishBotName(index?: number): string {
  const isMale = Math.random() < 0.5;
  const names = isMale ? turkishMaleNames : turkishFemaleNames;
  const randomName = names[Math.floor(Math.random() * names.length)];
  return `${randomName} Bot`;
}

export function generateUniqueBotNames(count: number): string[] {
  // Toplam mevcut isim havuzunu birleştir
  const allNames = [...turkishMaleNames, ...turkishFemaleNames];
  
  // Eğer istenen bot sayısı mevcut isim sayısından fazlaysa hata ver
  if (count > allNames.length) {
    throw new Error(`Not enough unique names to generate ${count} bot names`);
  }

  const botNames: string[] = [];
  const usedNames = new Set<string>();

  while (botNames.length < count) {
    const isMale = Math.random() < 0.5;
    const names = isMale ? turkishMaleNames : turkishFemaleNames;
    
    // Kullanılmamış isimlerden seç
    const availableNames = names.filter(name => !usedNames.has(name));
    
    if (availableNames.length === 0) {
      // Eğer seçilen cinsiyet için kullanılmamış isim kalmadıysa, diğer cinsiyetten seç
      const otherNames = isMale ? turkishFemaleNames : turkishMaleNames;
      const otherAvailableNames = otherNames.filter(name => !usedNames.has(name));
      
      if (otherAvailableNames.length === 0) {
        throw new Error('No more unique names available');
      }
      
      const randomName = otherAvailableNames[Math.floor(Math.random() * otherAvailableNames.length)];
      usedNames.add(randomName);
      botNames.push(`${randomName} Bot`);
    } else {
      const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
      usedNames.add(randomName);
      botNames.push(`${randomName} Bot`);
    }
  }

  return botNames;
}
