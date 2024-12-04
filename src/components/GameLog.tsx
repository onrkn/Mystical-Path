import React from 'react';

interface GameLogProps {
  log: string[];
}

export function GameLog({ log }: GameLogProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold mb-2">Oyun Geçmişi</h3>
      <div className="h-48 overflow-y-auto space-y-1">
        {log.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600 border-b border-gray-100 py-1">
            {entry}
          </p>
        ))}
      </div>
    </div>
  );
}