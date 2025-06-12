"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTour } from "@/hooks/useTour";

/**
 * Smart Tour Trigger Component
 * 
 * This component automatically detects user actions and triggers appropriate
 * tour flows to create a seamless onboarding experience.
 */
export default function SmartTourTrigger() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    startFlow, 
    completedFlows, 
    currentOnboardingStep, 
    isActive, 
    isOnboardingComplete 
  } = useTour();

  // Listen for company creation events
  useEffect(() => {
    const handleCompanyCreated = () => {
      console.log("Company created event detected");
      
      // Check if user is in the middle of onboarding
      if (!isOnboardingComplete && !isActive) {
        // Small delay to allow for navigation and state updates
        setTimeout(() => {
          // Check if we should continue the onboarding flow
          if (completedFlows.has("company-creation-guided") || completedFlows.has("complete-onboarding")) {
            console.log("Triggering dashboard and first product flow");
            startFlow("dashboard-and-first-product");
          }
        }, 2000);
      }
    };

    const handleCompanyListChanged = () => {
      console.log("Company list changed event detected");
      
      // This could indicate a company was just created
      // Check current path and onboarding state
      if (pathname === "/dashboard" && currentOnboardingStep >= 2 && !isActive) {
        setTimeout(() => {
          if (!completedFlows.has("dashboard-and-first-product")) {
            console.log("Auto-triggering dashboard tour from company list change");
            startFlow("dashboard-and-first-product");
          }
        }, 1500);
      }
    };

    // Listen for custom events
    window.addEventListener("companyCreated", handleCompanyCreated);
    window.addEventListener("companyListChanged", handleCompanyListChanged);

    return () => {
      window.removeEventListener("companyCreated", handleCompanyCreated);
      window.removeEventListener("companyListChanged", handleCompanyListChanged);
    };
  }, [startFlow, completedFlows, currentOnboardingStep, isActive, isOnboardingComplete, pathname]);

  // Smart page-based tour triggering
  useEffect(() => {
    if (isActive || isOnboardingComplete) return;

    const triggerAppropriateFlow = () => {
      const path = pathname;
      
      // Create company page - trigger company creation guide if appropriate
      if (path === "/create-company") {
        if (completedFlows.has("complete-onboarding") && !completedFlows.has("company-creation-guided")) {
          setTimeout(() => {
            console.log("Auto-triggering company creation guide");
            startFlow("company-creation-guided");
          }, 1000);
        }
      }
      
      // Product creation page - trigger product wizard if appropriate
      else if (path === "/product-list/product") {
        if (currentOnboardingStep >= 3 && !completedFlows.has("product-creation-wizard")) {
          setTimeout(() => {
            console.log("Auto-triggering product creation wizard");
            startFlow("product-creation-wizard");
          }, 1000);
        }
      }
      
      // Product list page - trigger advanced features if appropriate
      else if (path === "/product-list") {
        if (currentOnboardingStep >= 4 && !completedFlows.has("product-management-features")) {
          // Check if user actually has products (indicating they completed product creation)
          const hasProducts = document.querySelector("tbody tr td") !== null;
          if (hasProducts) {
            setTimeout(() => {
              console.log("Auto-triggering product management features");
              startFlow("product-management-features");
            }, 1500);
          }
        }
      }
      
      // Dashboard - trigger appropriate next step
      else if (path === "/dashboard") {
        if (currentOnboardingStep === 3 && !completedFlows.has("dashboard-and-first-product")) {
          setTimeout(() => {
            console.log("Auto-triggering dashboard tour");
            startFlow("dashboard-and-first-product");
          }, 1000);
        } else if (currentOnboardingStep >= 5 && !completedFlows.has("advanced-features")) {
          setTimeout(() => {
            console.log("Auto-triggering advanced features");
            startFlow("advanced-features");
          }, 1000);
        }
      }
    };

    // Small delay to ensure page is loaded
    const timeoutId = setTimeout(triggerAppropriateFlow, 500);
    
    return () => clearTimeout(timeoutId);
  }, [pathname, startFlow, completedFlows, currentOnboardingStep, isActive, isOnboardingComplete]);

  // Listen for product-related events
  useEffect(() => {
    const handleProductCreated = () => {
      console.log("Product created event detected");
      
      if (!isActive && currentOnboardingStep >= 4) {
        setTimeout(() => {
          // Navigate to product list and trigger management features
          router.push("/product-list");
          setTimeout(() => {
            if (!completedFlows.has("product-management-features")) {
              console.log("Triggering product management features after product creation");
              startFlow("product-management-features");
            }
          }, 1500);
        }, 2000);
      }
    };

    const handleProductUpdated = () => {
      console.log("Product updated event detected");
      
      // Similar logic for product updates
      if (!isActive && pathname === "/product-list/product" && currentOnboardingStep >= 4) {
        setTimeout(() => {
          router.push("/product-list");
          setTimeout(() => {
            if (!completedFlows.has("product-management-features")) {
              console.log("Triggering product management features after product update");
              startFlow("product-management-features");
            }
          }, 1500);
        }, 1000);
      }
    };

    // Create custom event listeners for product events
    window.addEventListener("productCreated", handleProductCreated);
    window.addEventListener("productUpdated", handleProductUpdated);

    return () => {
      window.removeEventListener("productCreated", handleProductCreated);
      window.removeEventListener("productUpdated", handleProductUpdated);
    };
  }, [router, startFlow, completedFlows, currentOnboardingStep, isActive, pathname]);

  // Smart flow continuation based on user actions
  useEffect(() => {
    const handleFlowContinuation = () => {
      // If user completes certain flows, automatically suggest or trigger next steps
      if (!isActive && !isOnboardingComplete) {
        
        // Check for completion patterns that should trigger next flows
        if (completedFlows.has("product-creation-wizard") && !completedFlows.has("product-management-features")) {
          // User completed product creation but hasn't seen management features
          if (pathname === "/product-list") {
            setTimeout(() => {
              console.log("Auto-continuing to product management features");
              startFlow("product-management-features");
            }, 2000);
          }
        }
        
        if (completedFlows.has("product-management-features") && !completedFlows.has("advanced-features")) {
          // User is ready for advanced features
          if (pathname === "/dashboard") {
            setTimeout(() => {
              console.log("Auto-continuing to advanced features");
              startFlow("advanced-features");
            }, 1500);
          }
        }
      }
    };

    // Run continuation check when flows change
    handleFlowContinuation();
  }, [completedFlows, isActive, isOnboardingComplete, pathname, startFlow]);

  // Smart recovery - if user gets lost during onboarding
  useEffect(() => {
    if (isOnboardingComplete || isActive) return;

    const handleLostUserRecovery = () => {
      // If user is in the middle of onboarding but on wrong page, guide them back
      const expectedPaths = {
        1: ["/create-company"], // After welcome
        2: ["/dashboard"], // After company creation
        3: ["/product-list/product"], // After dashboard
        4: ["/product-list"], // After product creation
        5: ["/dashboard"], // For advanced features
      };

      const currentExpectedPaths = expectedPaths[currentOnboardingStep as keyof typeof expectedPaths];
      
      if (currentExpectedPaths && !currentExpectedPaths.includes(pathname)) {
        console.log(`User might be lost. Expected: ${currentExpectedPaths}, Current: ${pathname}`);
        
        // Don't auto-redirect immediately, but could show a gentle nudge
        // This prevents aggressive redirects that might annoy users
      }
    };

    const timeoutId = setTimeout(handleLostUserRecovery, 3000);
    return () => clearTimeout(timeoutId);
  }, [currentOnboardingStep, pathname, isActive, isOnboardingComplete]);

  return null; // This component doesn't render anything
}

// Utility functions for dispatching tour events from other components
export const tourEvents = {
  companyCreated: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("companyCreated"));
    }
  },
  
  productCreated: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("productCreated"));
    }
  },
  
  productUpdated: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("productUpdated"));
    }
  },
  
  featureDiscovered: (featureId: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("featureDiscovered", { 
        detail: { featureId } 
      }));
    }
  }
};
