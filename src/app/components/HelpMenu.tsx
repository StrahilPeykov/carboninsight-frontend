"use client";

import { useState } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { useTour } from './TourProvider';

export default function HelpMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { startTour, resetTour } = useTour();

  const tours = [
    { id: 'main-onboarding', name: 'Getting Started Tour' },
    { id: 'product-list-tour', name: 'Product Management Tour' },
    { id: 'company-tour', name: 'Company Management Tour' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Help menu"
      >
        <HelpCircle size={16} />
        <span className="hidden sm:inline">Help</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-red-500" />
              Interactive Tours
            </h3>
            
            <div className="space-y-2">
              {tours.map(tour => (
                <button
                  key={tour.id}
                  onClick={() => {
                    resetTour(tour.id);
                    startTour(tour.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {tour.name}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click any tour to start a guided walkthrough of the features.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
