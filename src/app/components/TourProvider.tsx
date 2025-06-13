"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import OnboardingTour from './OnboardingTour';
import { usePathname } from 'next/navigation';

// Define proper interfaces for tour steps
interface BaseTourStep {
  page: string;
  target: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightPadding?: number;
}

interface InteractiveTourStep extends BaseTourStep {
  waitForAction: true;
  expectedAction: string;
}

interface StaticTourStep extends BaseTourStep {
  waitForAction?: false;
  expectedAction?: never;
}

type TourStep = InteractiveTourStep | StaticTourStep;

interface TourContextType {
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  resetTour: (tourId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
  isAnyTourActive: boolean;
  currentTourStep: number;
  setCurrentTourStep: (step: number) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: ReactNode;
}

// Define tour steps that can span multiple pages
const TOURS: Record<string, TourStep[]> = {
  'main-onboarding': [
    {
      page: '/',
      target: '.company-selector-button',
      title: 'Welcome to CarbonInsight!',
      content: 'Let\'s create your first company to get started. Click on the company selector to begin.',
      placement: 'bottom',
      waitForAction: true,
      expectedAction: 'click-company-selector',
    },
    {
      page: '/',
      target: 'a[href="/create-company"]',
      title: 'Create Your Company',
      content: 'Great! Now click on "Create" to set up your first company.',
      placement: 'bottom',
      waitForAction: true,
      expectedAction: 'navigate-to-create-company',
    },
    {
      page: '/create-company',
      target: 'input[name="name"]',
      title: 'Company Details',
      content: 'Enter your company name here. This will be used throughout the platform to identify your organization.',
      placement: 'right',
    },
    {
      page: '/create-company',
      target: 'input[name="vat_number"]',
      title: 'VAT Number',
      content: 'Enter your company\'s VAT number. This helps us verify your business and enables compliance features.',
      placement: 'right',
    },
    {
      page: '/create-company',
      target: 'button[type="submit"]',
      title: 'Almost Done!',
      content: 'Once you\'ve filled in all the details, click Submit to create your company. You\'ll then be able to add products and calculate their carbon footprint.',
      placement: 'top',
    },
  ],
  'product-list-tour': [
    {
      page: '/product-list',
      target: '.add-product-button',
      title: 'Add Your First Product',
      content: 'Click here to add a new product and start calculating its carbon footprint.',
      placement: 'left',
    },
    {
      page: '/product-list',
      target: 'input[placeholder*="Search"]',
      title: 'Search Products',
      content: 'Quickly find products by searching for their name, SKU, or manufacturer.',
      placement: 'bottom',
    },
    {
      page: '/product-list',
      target: '.export-button',
      title: 'Export Digital Product Passports',
      content: 'Export your product data in various formats including PDF reports and AAS packages.',
      placement: 'left',
    },
    {
      page: '/product-list',
      target: '.ai-button',
      title: 'AI-Powered Insights',
      content: 'Get personalized recommendations for reducing your product\'s carbon footprint.',
      placement: 'left',
    },
  ],
  'company-tour': [
    {
      page: '/list-companies',
      target: '.company-selector-button',
      title: 'Company Management',
      content: 'Click here to access company management features like settings, users, and data sharing.',
      placement: 'bottom',
    },
    {
      page: '/list-companies',
      target: '.company-settings-button',
      title: 'Company Settings',
      content: 'Manage company details, edit information, and configure your company profile.',
      placement: 'bottom',
    },
    {
      page: '/list-companies',
      target: 'a[href="/create-company"]',
      title: 'Create Additional Companies',
      content: 'You can create multiple companies if you manage different businesses or subsidiaries.',
      placement: 'bottom',
    },
  ],
};

export default function TourProvider({ children }: TourProviderProps) {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true);
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('tour-active');
    };
  }, []);

  // Load tour state from sessionStorage on mount
  useEffect(() => {
    if (!mounted) return;
    
    // Load completed tours
    const stored = localStorage.getItem('completedTours');
    if (stored) {
      try {
        setCompletedTours(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Failed to parse completed tours:', e);
      }
    }

    // Load active tour state from sessionStorage (for persistence across pages)
    const activeTourStored = sessionStorage.getItem('activeTour');
    const currentStepStored = sessionStorage.getItem('currentTourStep');
    
    if (activeTourStored) {
      setActiveTour(activeTourStored);
      setCurrentStep(currentStepStored ? parseInt(currentStepStored, 10) : 0);
      document.body.classList.add('tour-active');
    }
  }, [mounted]);

  // Save completed tours to localStorage
  const saveCompletedTours = (tours: Set<string>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedTours', JSON.stringify(Array.from(tours)));
    }
  };

  // Save active tour state to sessionStorage
  const saveActiveTourState = (tourId: string | null, step: number) => {
    if (typeof window !== 'undefined') {
      if (tourId) {
        sessionStorage.setItem('activeTour', tourId);
        sessionStorage.setItem('currentTourStep', step.toString());
        document.body.classList.add('tour-active');
      } else {
        sessionStorage.removeItem('activeTour');
        sessionStorage.removeItem('currentTourStep');
        document.body.classList.remove('tour-active');
      }
    }
  };

  const startTour = (tourId: string) => {
    if (TOURS[tourId]) {
      setActiveTour(tourId);
      setCurrentStep(0);
      saveActiveTourState(tourId, 0);
    }
  };

  const completeTour = (tourId: string) => {
    const newCompleted = new Set(completedTours);
    newCompleted.add(tourId);
    setCompletedTours(newCompleted);
    saveCompletedTours(newCompleted);
    setActiveTour(null);
    setCurrentStep(0);
    saveActiveTourState(null, 0);
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

  const setCurrentTourStep = (step: number) => {
    setCurrentStep(step);
    if (activeTour) {
      saveActiveTourState(activeTour, step);
    }
  };

  // Get current tour steps based on active tour and current page
  const getCurrentTourSteps = () => {
    if (!activeTour || !TOURS[activeTour]) return [];
    
    const allSteps = TOURS[activeTour];
    
    // Filter steps for current page
    const currentPageSteps = allSteps.filter(step => step.page === pathname);
    
    return currentPageSteps;
  };

  // Handle navigation between pages during tour
  useEffect(() => {
    if (!mounted || !activeTour) return;

    const allSteps = TOURS[activeTour];
    if (!allSteps) return;

    // Find the index of the first step for the current page
    const currentPageStepIndex = allSteps.findIndex(step => step.page === pathname);
    
    if (currentPageStepIndex !== -1) {
      // We're on a page that has tour steps
      const stepsBeforeThisPage = allSteps.slice(0, currentPageStepIndex).length;
      
      // If we're behind where we should be, update the step
      if (currentStep < stepsBeforeThisPage) {
        setCurrentTourStep(currentPageStepIndex);
      }
    }
  }, [pathname, activeTour, mounted]);

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

  const handleStepComplete = (action?: string) => {
    if (!activeTour) return;

    const allSteps = TOURS[activeTour];
    const currentStepData = allSteps[currentStep];

    // Check if step has waitForAction property and it's true
    if (currentStepData && 'waitForAction' in currentStepData && 
        currentStepData.waitForAction && 
        action === currentStepData.expectedAction) {
      // Move to next step
      if (currentStep < allSteps.length - 1) {
        setCurrentTourStep(currentStep + 1);
      } else {
        handleCompleteTour();
      }
    }
  };

  // Listen for specific user actions
  useEffect(() => {
    if (!mounted || !activeTour) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if company selector was clicked
      if (target.closest('.company-selector-button')) {
        handleStepComplete('click-company-selector');
      }
    };

    const handleNavigation = () => {
      // Check if we navigated to create company page
      if (pathname === '/create-company') {
        handleStepComplete('navigate-to-create-company');
      }
    };

    // Add listeners
    document.addEventListener('click', handleClick);
    
    // Call navigation handler immediately in case we just navigated
    handleNavigation();

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [mounted, activeTour, currentStep, pathname]);

  // Get steps to display for current page
  const stepsToDisplay = getCurrentTourSteps();
  const globalStepIndex = activeTour && TOURS[activeTour] 
    ? TOURS[activeTour].findIndex(step => step.page === pathname && stepsToDisplay[0] && step.target === stepsToDisplay[0].target)
    : -1;

  return (
    <TourContext.Provider
      value={{
        startTour,
        completeTour,
        resetTour,
        isTourCompleted,
        isAnyTourActive: !!activeTour,
        currentTourStep: currentStep,
        setCurrentTourStep,
      }}
    >
      {children}
      
      {mounted && activeTour && stepsToDisplay.length > 0 && globalStepIndex >= currentStep && (
        <OnboardingTour
          steps={stepsToDisplay}
          onComplete={handleCompleteTour}
          onSkip={handleSkipTour}
          currentStepIndex={currentStep - globalStepIndex}
          totalSteps={TOURS[activeTour].length}
          globalCurrentStep={currentStep}
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