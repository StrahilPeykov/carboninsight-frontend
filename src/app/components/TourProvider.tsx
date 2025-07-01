"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import OnboardingTour from "./OnboardingTour";
import { usePathname, useRouter } from "next/navigation";

// Define proper interfaces for tour steps
interface BaseTourStep {
  page: string;
  target: string;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
  spotlightPadding?: number;
  allowSkip?: boolean;
  allowClickOutside?: boolean;
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
  "main-onboarding": [
    {
      page: "*", // Available from any page
      target: ".company-selector-button",
      title: "Welcome to CarbonInsight!",
      content:
        "Let's get you started by creating your first company. This will allow you to add products and calculate their carbon footprints. Click on the company selector to begin.",
      placement: "bottom",
      waitForAction: true,
      expectedAction: "click-company-selector",
      allowSkip: true,
      allowClickOutside: false,
    },
    {
      page: "*", // Still on the same page with dropdown open
      target: '[data-tour-target="create-company"]',
      title: "Create Your First Company",
      content:
        'Perfect! Now click on "Create" to set up your company profile. This is the foundation for all your carbon footprint calculations.',
      placement: "left",
      waitForAction: true,
      expectedAction: "navigate-to-create-company",
      allowSkip: true,
      allowClickOutside: false,
    },
    {
      page: "/create-company",
      target: 'input[name="name"]',
      title: "Business Name",
      content:
        "Enter your company's legal business name. This will be used throughout the platform and in all generated reports and Carbon Footprint Reports.",
      placement: "right",
      spotlightPadding: 20,
      allowSkip: true,
      allowClickOutside: false,
    },
    {
      page: "/create-company",
      target: 'input[name="vat_number"]',
      title: "VAT Number",
      content:
        "Enter your company's VAT (Value Added Tax) number. This helps us verify your business identity and is required for compliance reporting.",
      placement: "right",
      spotlightPadding: 20,
      allowSkip: true,
      allowClickOutside: false,
    },
    {
      page: "/create-company",
      target: 'input[name="business_registration_number"]',
      title: "Business Registration Number",
      content:
        "Enter your official business registration number (Chamber of Commerce number, Company House number, etc.). This is used for legal identification and compliance.",
      placement: "right",
      spotlightPadding: 20,
      allowSkip: true,
      allowClickOutside: false,
    },
    {
      page: "/create-company",
      target: 'button[type="submit"]',
      title: "Complete Setup!",
      content:
        "Once you've filled in all the details, click Submit to create your company. You'll then be taken to the dashboard where you can start adding products and calculating their carbon footprint.",
      placement: "top",
      spotlightPadding: 20,
      allowSkip: true,
      allowClickOutside: false,
    },
  ],
  "product-list-tour": [
    {
      page: "*",
      target: '[data-tour-target="products-nav"]',
      title: "Product Management Tour",
      content:
        'Let\'s explore how to manage your products and calculate their carbon footprints. Click on the "Products" navigation button to get started.',
      placement: "bottom",
      waitForAction: true,
      expectedAction: "navigate-to-products",
      allowClickOutside: false,
      allowSkip: true,
    },
    {
      page: "/product-list",
      target: ".mb-6, .max-w-7xl",
      title: "Add Your First Product",
      content:
        "When you're ready to add products, you'll use the \"Add Product\" button here. For now, let's continue exploring the product management features.",
      placement: "center",
      allowClickOutside: false,
      allowSkip: true,
    },
    {
      page: "/product-list",
      target: 'input[placeholder*="Search"], input[placeholder*="search"]',
      title: "Search Products",
      content:
        "Quickly find products by searching for their name, SKU, or manufacturer. The search works across all your product data.",
      placement: "bottom",
      spotlightPadding: 8,
      allowClickOutside: false,
      allowSkip: true,
    },
    {
      page: "/product-list",
      target: ".max-w-7xl",
      title: "Product Actions & Features",
      content:
        "Once you have products, you'll see action buttons for each product: Export (download Carbon Footprint Reports), AI advice (carbon reduction recommendations), Edit, and Delete. The table shows key information like manufacturer, name, SKU, and carbon footprint.",
      placement: "center",
      allowClickOutside: false,
      allowSkip: true,
    },
    {
      page: "/product-list",
      target: ".max-w-7xl",
      title: "Product Management Complete",
      content:
        "You've completed the product management tour! You can now add products, search through them, and export Carbon Footprint Reports. Use the Help menu to restart tours anytime.",
      placement: "center",
      allowClickOutside: false,
      allowSkip: true,
    },
  ],
  "company-tour": [
    {
      page: "*",
      target: '[data-tour-target="dashboard-nav"]',
      title: "Company Management Tour",
      content:
        "Let's explore how to manage multiple companies. First, go to your dashboard where you can access company management features.",
      placement: "bottom",
      waitForAction: true,
      expectedAction: "navigate-to-dashboard",
      allowClickOutside: false,
      allowSkip: true,
    },
    {
      page: "/dashboard",
      target: '[data-tour-target="companies-link"]',
      title: "View All Companies",
      content:
        'From the dashboard, click on "Your Companies" to access the company management hub where you can view all your companies.',
      placement: "right",
      waitForAction: true,
      expectedAction: "navigate-to-companies",
      allowClickOutside: false,
      allowSkip: true,
    },
    {
      page: "/list-companies",
      target: "h1",
      title: "Company Management Hub",
      content:
        "This is your company management hub. Here you can create new companies, switch between them, and manage company settings and users.",
      placement: "bottom",
      allowClickOutside: false,
      allowSkip: true,
    },
    {
      page: "/list-companies",
      target: '[href="/create-company"]',
      title: "Create Additional Companies",
      content:
        "You can create multiple companies if you manage different businesses, subsidiaries, or want to separate different product lines.",
      placement: "bottom",
      allowClickOutside: false,
      allowSkip: true,
    },
    {
      page: "/list-companies",
      target: ".grid > div:first-child",
      title: "Company Cards & Quick Actions",
      content:
        'Each company is displayed as a card. Click "Select Company" to work with that company, or use the quick action buttons to manage users, view products, or handle data sharing requests.',
      placement: "right",
      allowClickOutside: false,
      allowSkip: true,
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
      document.body.classList.remove("tour-active");
    };
  }, []);

  // Load tour state from storage on mount
  useEffect(() => {
    if (!mounted) return;

    // Load completed tours
    const stored = localStorage.getItem("completedTours");
    if (stored) {
      try {
        setCompletedTours(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error("Failed to parse completed tours:", e);
      }
    }

    // Load active tour state from sessionStorage
    const activeTourStored = sessionStorage.getItem("activeTour");
    const currentStepStored = sessionStorage.getItem("currentTourStep");

    if (activeTourStored) {
      setActiveTour(activeTourStored);
      setCurrentStep(currentStepStored ? parseInt(currentStepStored, 10) : 0);
      document.body.classList.add("tour-active");
    }
  }, [mounted]);

  // Save completed tours to localStorage
  const saveCompletedTours = (tours: Set<string>) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("completedTours", JSON.stringify(Array.from(tours)));
    }
  };

  // Save active tour state to sessionStorage
  const saveActiveTourState = (tourId: string | null, step: number) => {
    if (typeof window !== "undefined") {
      if (tourId) {
        sessionStorage.setItem("activeTour", tourId);
        sessionStorage.setItem("currentTourStep", step.toString());
        document.body.classList.add("tour-active");
      } else {
        sessionStorage.removeItem("activeTour");
        sessionStorage.removeItem("currentTourStep");
        document.body.classList.remove("tour-active");
      }
    }
  };

  const startTour = (tourId: string) => {
    if (!TOURS[tourId]) {
      console.warn(`Tour ${tourId} not found`);
      return;
    }

    // Always start from step 0, regardless of current page
    setActiveTour(tourId);
    setCurrentStep(0);
    saveActiveTourState(tourId, 0);

    // Don't auto-navigate - let the tour guide the user
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
    if (!activeTour || !TOURS[activeTour]) {
      return [];
    }

    const allSteps = TOURS[activeTour];
    const currentStepData = allSteps[currentStep];

    if (!currentStepData) {
      return [];
    }

    // Normalize pathname
    const normalizedPathname =
      pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

    // Check if current step should be shown on this page
    const stepPage =
      currentStepData.page.endsWith("/") && currentStepData.page !== "/"
        ? currentStepData.page.slice(0, -1)
        : currentStepData.page;

    const isStepOnThisPage = stepPage === "*" || stepPage === normalizedPathname;

    if (!isStepOnThisPage) {
      return [];
    }

    return [currentStepData];
  };

  // Handle step progression - defined inside component to access state
  const handleStepProgressionRef = React.useRef<() => void>(() => {});

  handleStepProgressionRef.current = () => {
    if (!activeTour) return;

    const allSteps = TOURS[activeTour];
    const nextStep = currentStep + 1;

    if (nextStep < allSteps.length) {
      const nextStepData = allSteps[nextStep];
      const currentPage =
        pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

      // Check if next step is on a different page
      if (nextStepData.page !== "*" && nextStepData.page !== currentPage) {
        // Save the step progression before navigation
        setCurrentTourStep(nextStep);
        router.push(nextStepData.page);
      } else {
        // Same page, just advance the step
        setCurrentTourStep(nextStep);
      }
    } else {
      // Tour complete
      completeTour(activeTour);
    }
  };

  // Handle navigation between pages during tour
  useEffect(() => {
    if (!mounted || !activeTour) return;

    const allSteps = TOURS[activeTour];
    const currentStepData = allSteps[currentStep];

    if (!currentStepData) return;

    // Check if we just navigated to the expected page
    const normalizedPathname =
      pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

    // If current step expects us to be on a specific page and we just arrived there
    if (currentStepData.page !== "*" && currentStepData.page === normalizedPathname) {
      // Check if the previous step was a navigation action
      const prevStep = currentStep > 0 ? allSteps[currentStep - 1] : null;
      if (
        prevStep &&
        "expectedAction" in prevStep &&
        prevStep.expectedAction === "navigate-to-create-company"
      ) {
        // We've completed the navigation, the step has already been advanced
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

  // Listen for tour actions
  useEffect(() => {
    if (!mounted || !activeTour) return;

    const handleTourAction = (e: CustomEvent) => {
      const { action } = e.detail;
      const allSteps = TOURS[activeTour];
      const currentStepData = allSteps[currentStep];

      if (
        currentStepData &&
        "expectedAction" in currentStepData &&
        currentStepData.expectedAction === action
      ) {
        // For navigation actions, advance the step immediately
        if (
          action === "navigate-to-create-company" ||
          action === "navigate-to-products" ||
          action === "navigate-to-companies" ||
          action === "navigate-to-dashboard"
        ) {
          const nextStep = currentStep + 1;
          setCurrentTourStep(nextStep);
          return;
        }

        // For click-company-selector actions, add a delay to ensure dropdown opens
        if (action === "click-company-selector" || action === "click-company-selector-for-tour") {
          // Wait for dropdown to open before advancing
          setTimeout(() => {
            handleStepProgressionRef.current?.();
          }, 500); // Increased delay to ensure dropdown animation completes
          return;
        }
      }
    };

    const handleNextStep = () => {
      handleStepProgressionRef.current?.();
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const allSteps = TOURS[activeTour];
      const currentStepData = allSteps[currentStep];

      if (
        !currentStepData ||
        !("waitForAction" in currentStepData) ||
        !currentStepData.waitForAction
      ) {
        return;
      }

      const expectedTarget = currentStepData.target;
      const clickedElement = target.closest(expectedTarget);

      if (clickedElement) {
        // Dispatch the action event
        window.dispatchEvent(
          new CustomEvent("tourAction", {
            detail: { action: currentStepData.expectedAction },
          })
        );
      }
    };

    const handlePrevStep = () => {
      if (currentStep > 0) {
        const prevStep = currentStep - 1;
        const allSteps = TOURS[activeTour];
        const prevStepData = allSteps[prevStep];
        const currentPage =
          pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

        // Check if prev step is on a different page
        if (prevStepData.page !== "*" && prevStepData.page !== currentPage) {
          // Save the step before navigation
          setCurrentTourStep(prevStep);
          router.push(prevStepData.page);
        } else {
          // Same page, just go back
          setCurrentTourStep(prevStep);
        }
      }
    };

    window.addEventListener("tourAction" as any, handleTourAction);
    window.addEventListener("tourNextStep" as any, handleNextStep);
    window.addEventListener("tourPrevStep" as any, handlePrevStep);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("tourAction" as any, handleTourAction);
      window.removeEventListener("tourNextStep" as any, handleNextStep);
      window.removeEventListener("tourPrevStep" as any, handlePrevStep);
      document.removeEventListener("click", handleClick, true);
    };
  }, [mounted, activeTour, currentStep, pathname, router]);

  // Get steps to display
  const stepsToDisplay = getCurrentTourSteps();
  const allSteps = activeTour && TOURS[activeTour] ? TOURS[activeTour] : [];
  const shouldShowTour = mounted && activeTour && stepsToDisplay.length > 0;

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

      {shouldShowTour && (
        <OnboardingTour
          steps={stepsToDisplay}
          onComplete={handleCompleteTour}
          onSkip={handleSkipTour}
          currentStepIndex={0}
          totalSteps={allSteps.length}
          globalCurrentStep={currentStep}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
