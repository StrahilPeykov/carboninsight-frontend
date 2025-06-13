"use client";

import { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, CheckCircle } from 'lucide-react';
import { useTour } from './TourProvider';

export default function HelpMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const { startTour, resetTour, isTourCompleted } = useTour();

  // Check if user has a company selected
  useEffect(() => {
    const companyId = typeof window !== 'undefined' ? localStorage.getItem('selected_company_id') : null;
    setHasCompany(!!companyId);
  }, []);

  const tours = [
    { 
      id: 'main-onboarding', 
      name: 'Getting Started Tour',
      description: 'Learn the basics of CarbonInsight',
      available: true // Always available
    },
    { 
      id: 'product-list-tour', 
      name: 'Product Management Tour',
      description: 'Manage products and carbon footprints',
      available: hasCompany // Only available if company is selected
    },
    { 
      id: 'company-tour', 
      name: 'Company Management Tour',
      description: 'Manage company settings and users',
      available: true // Always available
    },
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
          
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-red-500" />
              Interactive Tours
            </h3>
            
            <div className="space-y-2">
              {tours.map(tour => {
                const isCompleted = isTourCompleted(tour.id);
                const isAvailable = tour.available;
                
                return (
                  <button
                    key={tour.id}
                    onClick={() => {
                      if (isAvailable) {
                        resetTour(tour.id);
                        startTour(tour.id);
                        setIsOpen(false);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      isAvailable 
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer' 
                        : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium">
                          {tour.name}
                          {isCompleted && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tour.description}
                        </div>
                        {!isAvailable && tour.id === 'product-list-tour' && (
                          <div className="text-xs text-orange-500 mt-1">
                            Select a company first
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tours guide you through key features. You can restart completed tours anytime.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}