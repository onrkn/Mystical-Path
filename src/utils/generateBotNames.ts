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

// Kullanılmış isimleri takip etmek için Set
let usedNames = new Set<string>();

export function generateTurkishBotName(): string {
  const allNames = [...turkishMaleNames, ...turkishFemaleNames];
  const availableNames = allNames.filter(name => !usedNames.has(name));
  
  // Eğer tüm isimler kullanılmışsa Set'i temizle
  if (availableNames.length === 0) {
    usedNames.clear();
    return generateTurkishBotName();
  }

  const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
  usedNames.add(randomName);
  return `${randomName} Bot`;
}

export function generateUniqueBotNames(count: number): string[] {
  // Set'i temizle
  usedNames.clear();
  
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    names.push(generateTurkishBotName());
  }
  return names;
}
