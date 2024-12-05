import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { Player } from '../types/game';

interface AllianceDialogProps {
  onClose: () => void;
}

export function AllianceDialog({ onClose }: AllianceDialogProps) {
  const [allianceName, setAllianceName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const { players, currentPlayerIndex, createAlliance } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allianceName && selectedPlayers.length > 1) {
      createAlliance(allianceName, [...selectedPlayers, currentPlayer.id]);
      onClose();
    }
  };

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-bold">İttifak Kur</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              İttifak Adı
            </label>
            <input
              type="text"
              value={allianceName}
              onChange={(e) => setAllianceName(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              İttifak Üyeleri
            </label>
            <div className="space-y-2">
              {players
                .filter(p => p.id !== currentPlayer.id && !p.allianceId)
                .map(player => (
                  <label
                    key={player.id}
                    className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => togglePlayer(player.id)}
                      className="rounded text-blue-600"
                    />
                    <span>{player.name}</span>
                  </label>
                ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!allianceName || selectedPlayers.length < 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              İttifak Kur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}