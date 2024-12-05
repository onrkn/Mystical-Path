import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function Notification() {
  const { notification, clearNotification } = useGameStore();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 z-50 w-full px-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[calc(100%-2rem)] sm:max-w-md"
        >
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              {notification.type === 'error' ? (
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              ) : notification.type === 'success' ? (
                <Check className="h-6 w-6 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 break-words">
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="mt-1 text-sm text-gray-500 break-words">
                    {notification.message}
                  </p>
                )}
              </div>

              <button
                onClick={clearNotification}
                className="flex-shrink-0 ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}