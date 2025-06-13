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
      title: 'Welcome to CarbonInsight! 🎉',
      content: 'Start by selecting or creating a company. This is where you\'ll manage all your products and carbon footprint data.',
      placement: 'bottom' as const,
    },
    {
      target: 'a[href="/dashboard"]',
      title: 'Your Dashboard',
      content: 'Access your dashboard to see an overview of your companies, products, and pending requests.',
      placement: 'bottom' as const,
    },
    {
      target: 'a[href="/product-list"]',
      title: 'Product Management',
      content: 'Here you can add products and calculate their carbon footprint using our step-by-step process.',
      placement: 'bottom' as const,
    },
    {
      target: '.theme-selector',
      title: 'Personalize Your Experience',
      content: 'Switch between light, dark, or system theme to match your preference.',
      placement: 'left' as const,
    },
    {
      target: 'body',
      title: 'You\'re All Set! 🚀',
      content: 'Start by creating your first company and adding products. We\'ll guide you through the carbon footprint calculation process.',
      placement: 'center' as const,
    },
  ],
  'product-list-tour': [
    {
      target: 'button:has-text("Add Product")',
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
      target: '.export-button:first-of-type',
      title: 'Export Digital Product Passports',
      content: 'Export your product data in various formats including PDF reports and AAS packages.',
      placement: 'left' as const,
    },
    {
      target: '.ai-button:first-of-type',
      title: 'AI-Powered Insights',
      content: 'Get personalized recommendations for reducing your product\'s carbon footprint.',
      placement: 'left' as const,
    },
  ],
  'company-tour': [
    {
      target: 'a[href="/create-company"]',
      title: 'Create a Company',
      content: 'Add a new company to start managing products and calculating carbon footprints.',
      placement: 'bottom' as const,
    },
    {
      target: '.company-settings-button',
      title: 'Company Settings',
      content: 'Manage company details, users, and data sharing preferences.',
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
