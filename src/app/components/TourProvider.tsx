"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import OnboardingTour from "./OnboardingTour";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

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
  requiresCompany?: boolean; // Flag to indicate if step requires a company
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
  skipTour: (tourId: string) => void; // separate skip function
  resetTour: (tourId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
  isTourSkipped: (tourId: string) => boolean; // check if tour was skipped
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
      requiresCompany: false, // This tour helps create the first company
    },
    {
      page: "*",
      target: '[data-tour-target="create-company"]',
      title: "Create Your First Company",
      content:
        'Perfect! Now click on "Create" to set up your company profile. This is the foundation for all your carbon footprint calculations.',
      placement: "left",
      waitForAction: true,
      expectedAction: "navigate-to-create-company",
      allowSkip: true,
      allowClickOutside: false,
      requiresCompany: false,
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
      requiresCompany: false,
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
      requiresCompany: false,
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
      requiresCompany: false,
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
      requiresCompany: false,
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
      requiresCompany: true,
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
      requiresCompany: true,
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
      requiresCompany: true,
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
      requiresCompany: true,
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
      requiresCompany: true,
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
      requiresCompany: true,
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
      requiresCompany: true,
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
      requiresCompany: true,
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
      requiresCompany: true,
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
      requiresCompany: true,
    },
  ],
};

export default function TourProvider({ children }: TourProviderProps) {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());
  const [skippedTours, setSkippedTours] = useState<Set<string>>(new Set()); // track skipped tours
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth(); // Get user info for user-specific storage

  // Generate user-specific storage keys
  const getUserStorageKey = (key: string) => {
    if (!user?.id) return key; // Fallback to generic key if no user
    return `${key}_user_${user.id}`;
  };

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true);

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("tour-active");
    };
  }, []);

  // Load tour state from storage when user changes or component mounts
  useEffect(() => {
    if (!mounted || !isAuthenticated || !user?.id) return;

    // Load completed tours for this specific user
    const completedKey = getUserStorageKey("completedTours");
    const completedStored = localStorage.getItem(completedKey);
    if (completedStored) {
      try {
        setCompletedTours(new Set(JSON.parse(completedStored)));
      } catch (e) {
        console.error("Failed to parse completed tours:", e);
        setCompletedTours(new Set()); // Reset to empty set if parsing fails
      }
    } else {
      setCompletedTours(new Set());
    }

    // Load skipped tours for this specific user
    const skippedKey = getUserStorageKey("skippedTours");
    const skippedStored = localStorage.getItem(skippedKey);
    if (skippedStored) {
      try {
        setSkippedTours(new Set(JSON.parse(skippedStored)));
      } catch (e) {
        console.error("Failed to parse skipped tours:", e);
        setSkippedTours(new Set());
      }
    } else {
      setSkippedTours(new Set());
    }

    // Load active tour state from sessionStorage (keep user-specific)
    const activeTourKey = getUserStorageKey("activeTour");
    const currentStepKey = getUserStorageKey("currentTourStep");
    
    const activeTourStored = sessionStorage.getItem(activeTourKey);
    const currentStepStored = sessionStorage.getItem(currentStepKey);

    if (activeTourStored) {
      setActiveTour(activeTourStored);
      setCurrentStep(currentStepStored ? parseInt(currentStepStored, 10) : 0);
      document.body.classList.add("tour-active");
    }
  }, [mounted, isAuthenticated, user?.id]);

  // Clear tour data when user logs out
  useEffect(() => {
    if (!isAuthenticated && mounted) {
      // User logged out, clear tour state but NOT localStorage data
      setCompletedTours(new Set());
      setSkippedTours(new Set());
      setActiveTour(null);
      setCurrentStep(0);
      
      // Clear session storage (active tour state)
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.includes("activeTour") || key.includes("currentTourStep")) {
          sessionStorage.removeItem(key);
        }
      });
      
      document.body.classList.remove("tour-active");
    }
  }, [isAuthenticated, mounted]);

  // Save completed tours to localStorage with user-specific key
  const saveCompletedTours = (tours: Set<string>) => {
    if (typeof window !== "undefined" && user?.id) {
      const userSpecificKey = getUserStorageKey("completedTours");
      localStorage.setItem(userSpecificKey, JSON.stringify(Array.from(tours)));
    }
  };

  // Save skipped tours to localStorage with user-specific key
  const saveSkippedTours = (tours: Set<string>) => {
    if (typeof window !== "undefined" && user?.id) {
      const userSpecificKey = getUserStorageKey("skippedTours");
      localStorage.setItem(userSpecificKey, JSON.stringify(Array.from(tours)));
    }
  };

  // Save active tour state to sessionStorage with user-specific key
  const saveActiveTourState = (tourId: string | null, step: number) => {
    if (typeof window !== "undefined" && user?.id) {
      const activeTourKey = getUserStorageKey("activeTour");
      const currentStepKey = getUserStorageKey("currentTourStep");
      
      if (tourId) {
        sessionStorage.setItem(activeTourKey, tourId);
        sessionStorage.setItem(currentStepKey, step.toString());
        document.body.classList.add("tour-active");
      } else {
        sessionStorage.removeItem(activeTourKey);
        sessionStorage.removeItem(currentStepKey);
        document.body.classList.remove("tour-active");
      }
    }
  };

  // Check if user has company selected
  const hasCompany = () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("selected_company_id");
  };

  const startTour = (tourId: string) => {
    if (!TOURS[tourId]) {
      console.warn(`Tour ${tourId} not found`);
      return;
    }

<<<<<<< HEAD
    if (!user?.id) {
      console.warn("Cannot start tour: user not authenticated");
      return;
    }

=======
>>>>>>> main
    // Check if tour requires a company and user doesn't have one
    const tourSteps = TOURS[tourId];
    const requiresCompany = tourSteps.some(step => step.requiresCompany);
    
    if (requiresCompany && !hasCompany()) {
      console.warn(`Tour ${tourId} requires a company to be selected`);
      
      // Show a helpful message to the user
      if (typeof window !== "undefined") {
        const message = "This tour requires a company to be selected. Please create or select a company first.";
        
        // Create a temporary announcement
        const announcement = document.createElement("div");
        announcement.setAttribute("role", "alert");
        announcement.setAttribute("aria-live", "assertive");
        announcement.className = "sr-only";
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
          if (announcement.parentNode) {
            document.body.removeChild(announcement);
          }
        }, 3000);
      }
      
      return;
    }

    // Always start from step 0, regardless of current page
    setActiveTour(tourId);
    setCurrentStep(0);
    saveActiveTourState(tourId, 0);
  };

  const completeTour = (tourId: string) => {
    if (!user?.id) return;
    
    const newCompleted = new Set(completedTours);
    newCompleted.add(tourId);
    setCompletedTours(newCompleted);
    saveCompletedTours(newCompleted);
    
    // Remove from skipped if it was there
    const newSkipped = new Set(skippedTours);
    newSkipped.delete(tourId);
    setSkippedTours(newSkipped);
    saveSkippedTours(newSkipped);
    
    setActiveTour(null);
    setCurrentStep(0);
    saveActiveTourState(null, 0);
  };

  // Separate skip function that doesn't mark as completed
  const skipTour = (tourId: string) => {
    if (!user?.id) return;
    
    const newSkipped = new Set(skippedTours);
    newSkipped.add(tourId);
    setSkippedTours(newSkipped);
    saveSkippedTours(newSkipped);
    
    setActiveTour(null);
    setCurrentStep(0);
    saveActiveTourState(null, 0);
  };

  const resetTour = (tourId: string) => {
    if (!user?.id) return;
    
    // Remove from both completed and skipped
    const newCompleted = new Set(completedTours);
    newCompleted.delete(tourId);
    setCompletedTours(newCompleted);
    saveCompletedTours(newCompleted);
    
    const newSkipped = new Set(skippedTours);
    newSkipped.delete(tourId);
    setSkippedTours(newSkipped);
    saveSkippedTours(newSkipped);
  };

  const isTourCompleted = (tourId: string) => {
    return completedTours.has(tourId);
  };

  const isTourSkipped = (tourId: string) => {
    return skippedTours.has(tourId);
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

    // Additional safety check: if step requires company but user doesn't have one, skip tour
    if (currentStepData.requiresCompany && !hasCompany()) {
<<<<<<< HEAD
      console.warn(`Current tour step requires company but none selected. Skipping tour.`);
      skipTour(activeTour);
=======
      console.warn(`Current tour step requires company but none selected. Ending tour.`);
      completeTour(activeTour);
>>>>>>> main
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

<<<<<<< HEAD
      // Additional safety check: if next step requires company but user doesn't have one, skip tour
      if (nextStepData.requiresCompany && !hasCompany()) {
        console.warn(`Next tour step requires company but none selected. Skipping tour.`);
        skipTour(activeTour);
=======
      // Additional safety check: if next step requires company but user doesn't have one, end tour
      if (nextStepData.requiresCompany && !hasCompany()) {
        console.warn(`Next tour step requires company but none selected. Ending tour.`);
        completeTour(activeTour);
>>>>>>> main
        return;
      }

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
      // Tour complete - actually completed, not skipped
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
      skipTour(activeTour); // Use skip function instead of complete
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
          }, 500);
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
        skipTour, // expose skip function
        resetTour,
        isTourCompleted,
        isTourSkipped, // expose skip check
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
          onSkip={handleSkipTour} // This will call skipTour, not completeTour
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
