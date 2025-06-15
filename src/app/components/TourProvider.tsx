"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import OnboardingTour from './OnboardingTour';
import { usePathname, useRouter } from 'next/navigation';

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
      page: '*', // Available from any page
      target: '.company-selector-button',
      title: 'Welcome to CarbonInsight!',
      content: 'Let\'s create your first company to get started. Click on the company selector to begin.',
      placement: 'bottom',
      waitForAction: true,
      expectedAction: 'click-company-selector',
    },
    {
      page: '*', // Still on the same page with dropdown open
      target: '[data-tour-target="create-company"]',
      title: 'Create Your Company',
      content: 'Great! Now click on "Create" to set up your first company.',
      placement: 'left',
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
      placement: 'left',
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
  const router = useRouter();

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
    if (!TOURS[tourId]) {
      console.warn(`Tour ${tourId} not found`);
      return;
    }

    const tour = TOURS[tourId];
    const firstStepPage = tour[0]?.page;
    
    // If the first step is not a wildcard and we're not on that page, navigate there
    if (firstStepPage && firstStepPage !== '*' && pathname !== firstStepPage) {
      // Save the tour state before navigating
      setActiveTour(tourId);
      setCurrentStep(0);
      saveActiveTourState(tourId, 0);
      
      // Navigate to the first page of the tour
      router.push(firstStepPage);
    } else {
      // We're already on the right page or it's a wildcard, start the tour
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
    
    // Filter steps for current page or wildcard pages
    const currentPageSteps = allSteps.filter(step => 
      step.page === pathname || step.page === '*'
    );
    
    return currentPageSteps;
  };

  // Handle navigation between pages during tour
  useEffect(() => {
    if (!mounted || !activeTour) return;

    const allSteps = TOURS[activeTour];
    if (!allSteps) return;

    // Check if we just navigated to a page that matches our expected next step
    const currentStepData = allSteps[currentStep];
    
    // If we're waiting for navigation to create-company and we just arrived there
    if (currentStepData && 
        'expectedAction' in currentStepData &&
        currentStepData.expectedAction === 'navigate-to-create-company' && 
        pathname === '/create-company') {
      // Move to the next step
      const nextStep = currentStep + 1;
      if (nextStep < allSteps.length) {
        setCurrentTourStep(nextStep);
      }
      return;
    }

    // Find the index of the first step for the current page (including wildcards)
    const currentPageStepIndex = allSteps.findIndex(step => 
      step.page === pathname || step.page === '*'
    );
    
    if (currentPageStepIndex !== -1) {
      // We're on a page that has tour steps
      const stepsBeforeThisPage = allSteps.slice(0, currentPageStepIndex).filter(s => 
        s.page !== '*' && s.page !== pathname
      ).length;
      
      // If we're behind where we should be, update the step
      if (currentStep < stepsBeforeThisPage) {
        setCurrentTourStep(currentPageStepIndex);
      }
    }
  }, [pathname, activeTour, mounted, currentStep]);

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

  // Listen for tour actions (like clicking elements with waitForAction)
  useEffect(() => {
    if (!mounted || !activeTour) return;

    const handleTourAction = (e: CustomEvent) => {
      const { action } = e.detail;
      const allSteps = TOURS[activeTour];
      const currentStepData = allSteps[currentStep];

      if (currentStepData && 'expectedAction' in currentStepData && 
          currentStepData.expectedAction === action) {
        // Move to next step
        if (currentStep < allSteps.length - 1) {
          const nextStep = currentStep + 1;
          const nextStepData = allSteps[nextStep];
          
          // If next step is on a different page, navigate
          if (nextStepData.page !== pathname && nextStepData.page !== '*') {
            setCurrentTourStep(nextStep);
            // For navigation actions, let the natural navigation happen
            if (action === 'navigate-to-create-company') {
              // The link click will handle navigation
              return;
            }
            router.push(nextStepData.page);
          } else {
            setCurrentTourStep(nextStep);
          }
        } else {
          handleCompleteTour();
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const allSteps = TOURS[activeTour];
      const currentStepData = allSteps[currentStep];
      
      // Only process clicks if we're waiting for an action
      if (!currentStepData || !('waitForAction' in currentStepData) || !currentStepData.waitForAction) {
        return;
      }
      
      // Check if the clicked element matches the expected target
      const expectedTarget = currentStepData.target;
      const clickedElement = target.closest(expectedTarget);
      
      if (clickedElement) {
        // Prevent the company selector from closing during tour
        if (currentStepData.expectedAction === 'click-company-selector') {
          // Keep the dropdown open
          setTimeout(() => {
            const dropdown = document.querySelector('.company-selector-button');
            if (dropdown && dropdown.getAttribute('aria-expanded') === 'false') {
              (dropdown as HTMLButtonElement).click();
            }
          }, 50);
        }
        
        // Handle navigation to create company
        if (currentStepData.expectedAction === 'navigate-to-create-company') {
          // The button's onClick will handle navigation
          // Just dispatch the action to progress the tour
          window.dispatchEvent(new CustomEvent('tourAction', { 
            detail: { action: currentStepData.expectedAction } 
          }));
          return;
        }
        
        window.dispatchEvent(new CustomEvent('tourAction', { 
          detail: { action: currentStepData.expectedAction } 
        }));
      }
    };

    // Also listen for navigation events to progress tour
    const handleNavigation = () => {
      const allSteps = TOURS[activeTour];
      const currentStepData = allSteps[currentStep];
      
      // Check if we navigated to the expected page
      if (currentStepData && pathname === '/create-company' && 
          currentStepData.expectedAction === 'navigate-to-create-company') {
        // We've reached the create company page, move to next step
        const nextStep = currentStep + 1;
        if (nextStep < allSteps.length) {
          setCurrentTourStep(nextStep);
        }
      }
    };

    window.addEventListener('tourAction' as any, handleTourAction);
    document.addEventListener('click', handleClick, true); // Use capture phase
    
    // Small delay to ensure page has rendered
    const navigationTimer = setTimeout(handleNavigation, 100);

    return () => {
      window.removeEventListener('tourAction' as any, handleTourAction);
      document.removeEventListener('click', handleClick, true);
      clearTimeout(navigationTimer);
    };
  }, [mounted, activeTour, currentStep, pathname, router]);

  // Get steps to display for current page
  const stepsToDisplay = getCurrentTourSteps();
  
  // Find the global index of the current step
  const globalStepIndex = activeTour && TOURS[activeTour] && stepsToDisplay.length > 0
    ? TOURS[activeTour].findIndex(step => 
        (step.page === pathname || step.page === '*') && 
        step.target === stepsToDisplay[0].target
      )
    : -1;

  // Calculate the local step index within the current page's steps
  const localStepIndex = Math.max(0, currentStep - globalStepIndex);

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
      
      {mounted && activeTour && stepsToDisplay.length > 0 && globalStepIndex !== -1 && currentStep >= globalStepIndex && (
        <OnboardingTour
          steps={stepsToDisplay}
          onComplete={handleCompleteTour}
          onSkip={handleSkipTour}
          currentStepIndex={localStepIndex}
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
