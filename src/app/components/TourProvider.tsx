"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import OnboardingTour from './OnboardingTour';

interface TourContextType {
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  resetTour: (tourId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
  isAnyTourActive: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: ReactNode;
}

// Define different tours for different parts of the app
const TOURS = {
  'main-onboarding': [
    {
      target: '.company-selector-button',
      title: 'Welcome to CarbonInsight!',
      content: 'First, you\'ll need to create or select a company. Click here to get started with your company setup.',
      placement: 'bottom' as const,
    },
    {
      target: 'a[href="/create-company"]',
      title: 'Create Your Company',
      content: 'Click here to create your first company. You\'ll enter your business details to get started.',
      placement: 'bottom' as const,
    },
    {
      target: 'body',
      title: 'You\'re All Set!',
      content: 'Once you have a company set up, you can add products and calculate their carbon footprint. The navigation will update to show Dashboard and Products options.',
      placement: 'center' as const,
    },
  ],
  'product-list-tour': [
    {
      target: '.add-product-button',
      title: 'Add Your First Product',
      content: 'Click here to add a new product and start calculating its carbon footprint.',
      placement: 'left' as const,
    },
    {
      target: 'input[placeholder*="Search"]',
      title: 'Search Products',
      content: 'Quickly find products by searching for their name, SKU, or manufacturer.',
      placement: 'bottom' as const,
    },
    {
      target: '.export-button',
      title: 'Export Digital Product Passports',
      content: 'Export your product data in various formats including PDF reports and AAS packages.',
      placement: 'left' as const,
    },
    {
      target: '.ai-button',
      title: 'AI-Powered Insights',
      content: 'Get personalized recommendations for reducing your product\'s carbon footprint.',
      placement: 'left' as const,
    },
  ],
  'company-tour': [
    {
      target: '.company-selector-button',
      title: 'Company Management',
      content: 'Click here to access company management features like settings, users, and data sharing.',
      placement: 'bottom' as const,
    },
    {
      target: '.company-settings-button',
      title: 'Company Settings',
      content: 'Manage company details, edit information, and configure your company profile.',
      placement: 'bottom' as const,
    },
    {
      target: 'a[href="/create-company"]',
      title: 'Create Additional Companies',
      content: 'You can create multiple companies if you manage different businesses or subsidiaries.',
      placement: 'bottom' as const,
    },
  ],
};

export default function TourProvider({ children }: TourProviderProps) {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load completed tours from localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    
    const stored = localStorage.getItem('completedTours');
    if (stored) {
      try {
        setCompletedTours(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Failed to parse completed tours:', e);
      }
    }
  }, [mounted]);

  // Save completed tours to localStorage
  const saveCompletedTours = (tours: Set<string>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedTours', JSON.stringify(Array.from(tours)));
    }
  };

  const startTour = (tourId: string) => {
    if (TOURS[tourId as keyof typeof TOURS]) {
      setActiveTour(tourId);
    }
  };

  const completeTour = (tourId: string) => {
    const newCompleted = new Set(completedTours);
    newCompleted.add(tourId);
    setCompletedTours(newCompleted);
    saveCompletedTours(newCompleted);
    setActiveTour(null);
  };

  const resetTour = (tourId: string) => {
    const newCompleted = new Set(completedTours);
    newCompleted.delete(tourId);
    setCompletedTours(newCompleted);
    saveCompletedTours(newCompleted);
  };

  const isTourCompleted = (tourId: string) => {
    return completedTours.has(tourId);
  };

  const handleCompleteTour = () => {
    if (activeTour) {
      completeTour(activeTour);
    }
  };

  const handleSkipTour = () => {
    if (activeTour) {
      completeTour(activeTour);
    }
  };

  return (
    <TourContext.Provider
      value={{
        startTour,
        completeTour,
        resetTour,
        isTourCompleted,
        isAnyTourActive: !!activeTour,
      }}
    >
      {children}
      
      {mounted && activeTour && TOURS[activeTour as keyof typeof TOURS] && (
        <OnboardingTour
          steps={TOURS[activeTour as keyof typeof TOURS]}
          onComplete={handleCompleteTour}
          onSkip={handleSkipTour}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
