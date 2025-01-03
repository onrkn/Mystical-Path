import { GetState, SetState } from 'zustand';
import { GameState, Property } from '../../types/game';
import { handleBankruptcy } from '../utils/playerUtils';
import { squares } from '../../data/board';
import { calculateItemBonuses } from '../utils/itemUtils';

export const calculateRent = (property: Property, get: GetState<GameState>) => {
  const { weather, settings, kingPosition } = get();
  
  // Temel kira hesaplaması (seviye bonusu)
  let rent = property.baseRent * (1 + ((property.level - 1) * 0.2));
  
  // Ayarlar çarpanı (varsayılan 1 olarak ayarlandı)
  const rentMultiplier = settings?.propertyRentMultiplier ?? 1;
  rent = rent * rentMultiplier;
  
  // Hava durumu etkisi
  if (weather === 'rain' && settings.weatherEnabled) {
    rent = rent * 0.5;
  }
  
  // Kral bonusu kontrolü
  const kingSquare = squares.find(s => s.id === kingPosition);
  const isKingHere = kingSquare?.property?.id === property.id;
  if (isKingHere && settings.kingEnabled) {
    rent = rent * 10;
  }
  
  return Math.floor(rent);
};

export const handlePropertyActions = (set: SetState<GameState>, get: GetState<GameState>) => ({
  purchaseProperty: (property: Property) => {
    const { players, currentPlayerIndex } = get();
    const currentPlayer = players[currentPlayerIndex];
    
    // Find the square with this property
    const propertySquare = squares.find(s => s.property?.id === property.id);
    
    // Validate that the current player is on this square
    const isPlayerOnProperty = currentPlayer.position === propertySquare?.id;

    if (!isPlayerOnProperty) {
      get().showNotification({
        title: 'Hata',
        message: 'Bu mülkü sadece üzerinde duran oyuncu satın alabilir!',
        type: 'error'
      });
      return;
    }
    
    if (currentPlayer.coins >= property.price) {
      currentPlayer.coins -= property.price;
      currentPlayer.propertyPurchases += property.price;
      currentPlayer.properties.push(property);
      property.ownerId = currentPlayer.id;
      
      // Apply rent calculation
      property.rent = calculateRent(property, get);
      
      // Add XP for property purchase
      currentPlayer.xp += 10;
      
      set({
        players,
        showPropertyDialog: false,
        selectedProperty: null,
        waitingForDecision: false,
        currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
      });
      
      get().showNotification({
        title: 'Mülk Satın Alındı',
        message: `${currentPlayer.name} ${property.name}'yi ${property.price} altına satın aldı!`,
        type: 'success'
      });
      get().addToLog(`<span class="text-green-500">${currentPlayer.name} ${property.name}'yi satın aldı!</span>`);

      // If next player is bot and no dialogs are open, trigger bot turn
      const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
      if (nextPlayer.isBot && !get().showMarketDialog && !get().showBossDialog) {
        setTimeout(() => get().handleBotTurn(), 1000);
      }
    }
  },

  upgradeProperty: (propertyId: string) => {
    console.log('upgradeProperty called with:', propertyId); // Debug log
    const { players, currentPlayerIndex } = get();
    const currentPlayer = players[currentPlayerIndex];
    
    // Mülkü bul
    const property = currentPlayer.properties.find(p => p.id === propertyId);
    console.log('Found property:', property); // Debug log
    
    if (!property) {
      console.error('Property not found:', propertyId);
      return;
    }

    if (property.level >= 5) {
      get().showNotification({
        title: 'Maksimum Seviye',
        message: 'Bu mülk maksimum seviyeye ulaştı!',
        type: 'error'
      });
      return;
    }

    const upgradePrice = property.upgradePrice || 50;
    if (currentPlayer.coins < upgradePrice) {
      get().showNotification({
        title: 'Yetersiz Bakiye',
        message: 'Mülkü geliştirmek için yeterli altınınız yok!',
        type: 'error'
      });
      return;
    }

    // Güncellemeleri yap
    property.level++;
    property.rent = calculateRent(property, get);
    currentPlayer.coins -= upgradePrice;
    currentPlayer.propertyUpgrades += upgradePrice;

    // Güncellenmiş oyuncular listesini oluştur
    const updatedPlayers = players.map(p => {
      if (p.id === currentPlayer.id) {
        return {
          ...p,
          coins: currentPlayer.coins,
          propertyUpgrades: currentPlayer.propertyUpgrades,
          properties: p.properties.map(prop => 
            prop.id === property.id 
              ? { ...prop, level: property.level, rent: property.rent }
              : prop
          )
        };
      }
      return p;
    });
    
    // State'i güncelle
    set({ players: updatedPlayers });
    console.log('State updated with:', updatedPlayers); // Debug log
    
    // Bildirimleri göster
    get().showNotification({
      title: 'Mülk Geliştirildi',
      message: `${property.name} seviye ${property.level}'e yükseltildi!`,
      type: 'success'
    });
    get().addToLog(`<span class="text-blue-500">${currentPlayer.name} ${property.name}'yi geliştirdi! (Seviye ${property.level})</span>`);
  },

  payRent: (player: GameState['players'][0], owner: GameState['players'][0], amount: number) => {
    const { players, currentPlayerIndex, weather } = get();
    
    // Yağmur varsa kirayı %50 düşür
    const finalAmount = weather === 'rain' ? Math.floor(amount * 0.5) : amount;
    
    // Oyuncunun kira ödeyecek yeterli altını yoksa
    if (player.coins < finalAmount) {
      // Eğer altın miktarı negatife düşecekse direkt iflas et
      handleBankruptcy(player, finalAmount, owner, get, set);
      return;
    }

    // Player can afford rent
    player.coins -= finalAmount;
    player.rentPaid += finalAmount;
    owner.coins += finalAmount;
    owner.rentCollected += finalAmount;
    
    get().showNotification({
      title: 'Kira Ödendi',
      message: `${player.name}, ${owner.name}'e ${finalAmount} altın kira ödedi!${weather === 'rain' ? ' (Yağmur İndirimi)' : ''}`,
      type: 'info'
    });
    get().addToLog(`<span class="text-blue-500">${player.name}, ${owner.name}'e ${finalAmount} altın kira ödedi!${weather === 'rain' ? ' (Yağmur İndirimi)' : ''}</span>`);

    set({
      players: [...players],
      rentInfo: null,
      waitingForDecision: false,
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length
    });

    // If next player is bot, trigger bot turn
    const nextPlayer = players[(currentPlayerIndex + 1) % players.length];
    if (nextPlayer.isBot) {
      setTimeout(() => get().handleBotTurn(), 1000);
    }
  }
});