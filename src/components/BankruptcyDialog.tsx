import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface BankruptcyDialogProps {
  playerName: string;
  onClose: () => void;
}

export function BankruptcyDialog({ playerName, onClose }: BankruptcyDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 max-w-md w-full m-4"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="inline-block text-red-500 mb-4"
          >
            <AlertTriangle className="w-16 h-16" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-4">İflas!</h2>
          
          <p className="text-gray-600 mb-6">
            {playerName} iflas etti ve oyundan elendi! Tüm mülkleri satışa çıkarıldı.
          </p>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tamam
          </button>
        </div>
      </motion.div>
    </div>
  );
}