"use client";

import { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, CheckCircle, Play } from 'lucide-react';
import { useTour } from './TourProvider';
import { usePathname } from 'next/navigation';

export default function HelpMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const pathname = usePathname();
  const { startTour, resetTour, isTourCompleted, isAnyTourActive } = useTour();

  // Check if user has a company selected
  useEffect(() => {
    const companyId = typeof window !== 'undefined' ? localStorage.getItem('selected_company_id') : null;
    setHasCompany(!!companyId);
  }, []);

  const tours = [
    { 
      id: 'main-onboarding', 
      name: 'Getting Started Tour',
      description: 'Learn the basics and create your first company',
      available: true,
      canRestart: true
    },
    { 
      id: 'product-list-tour', 
      name: 'Product Management Tour',
      description: 'Manage products and carbon footprints',
      available: hasCompany && pathname === '/product-list',
      canRestart: pathname === '/product-list'
    },
    { 
      id: 'company-tour', 
      name: 'Company Management Tour',
      description: 'Manage company settings and users',
      available: pathname === '/list-companies',
      canRestart: pathname === '/list-companies'
    },
  ];

  const handleStartTour = (tourId: string) => {
    // Clear any session storage that might interfere
    sessionStorage.removeItem('hasSeenProductListTour');
    sessionStorage.removeItem('hasSeenCompanyListTour');
    
    // Reset and start the tour
    resetTour(tourId);
    startTour(tourId);
    setIsOpen(false);
  };

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
          
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-red-500" />
              Interactive Tours
            </h3>

            {isAnyTourActive && (
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  A tour is currently active
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              {tours.map(tour => {
                const isCompleted = isTourCompleted(tour.id);
                const isAvailable = tour.available;
                const canStart = tour.canRestart || !isCompleted;
                
                return (
                  <button
                    key={tour.id}
                    onClick={() => {
                      if (isAvailable && canStart) {
                        handleStartTour(tour.id);
                      }
                    }}
                    disabled={!isAvailable || !canStart || isAnyTourActive}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      isAvailable && canStart && !isAnyTourActive
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
                        {!isAvailable && tour.id === 'product-list-tour' && !hasCompany && (
                          <div className="text-xs text-orange-500 mt-1">
                            Create a company first
                          </div>
                        )}
                        {!isAvailable && tour.id === 'product-list-tour' && hasCompany && (
                          <div className="text-xs text-orange-500 mt-1">
                            Navigate to Products page
                          </div>
                        )}
                        {!isAvailable && tour.id === 'company-tour' && (
                          <div className="text-xs text-orange-500 mt-1">
                            Navigate to Companies page
                          </div>
                        )}
                        {isAnyTourActive && (
                          <div className="text-xs text-blue-500 mt-1">
                            Complete current tour first
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
                Tours guide you through key features step by step. The Getting Started tour will help you create your first company.
              </p>
              {isAnyTourActive && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Follow the highlighted elements to complete the current tour.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
