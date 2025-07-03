// Client-side component directive - required for DOM event listeners and browser APIs
"use client";

// React hooks for lifecycle management and referencing mutable values
import { useEffect, useRef } from "react";
// Next.js navigation hooks for programmatic routing and pathname tracking
import { useRouter, usePathname } from "next/navigation";
// Tour configuration and type definitions for step management
import { TOURS, TourStep } from "./tourDefinitions";

// Props interface for tour event handling hook
// Provides external control and state management for tour progression
interface TourEventHandlersProps {
  activeTour: string | null; // Currently active tour identifier (null if no tour)
  currentStep: number; // Zero-based index of current step in active tour
  mounted: boolean; // Component mount state to prevent premature event handling
  setCurrentTourStep: (step: number) => void; // Function to update current step state
  completeTour: (tourId: string) => void; // Function to mark tour as completed and cleanup
}

// Custom hook that manages tour event handling and user interaction coordination
// Handles cross-page navigation, step progression, and user action tracking
// Integrates with browser events and Next.js routing for seamless tour experience
export function useTourEventHandlers({
  activeTour,
  currentStep,
  mounted,
  setCurrentTourStep,
  completeTour,
}: TourEventHandlersProps) {
  // Next.js router for programmatic navigation during multi-page tours
  const router = useRouter();
  // Current pathname for route-based tour step filtering and navigation logic
  const pathname = usePathname();

  // Mutable ref for step progression handler to avoid stale closure issues
  // Allows dynamic updates to progression logic without recreating event listeners
  const handleStepProgressionRef = useRef<() => void>(() => {});

  // Core step progression logic - handles advancement through tour sequence
  // Manages cross-page navigation and tour completion detection
  handleStepProgressionRef.current = () => {
    if (!activeTour) return;

    // Get complete step sequence for current tour
    const allSteps = TOURS[activeTour];
    const nextStep = currentStep + 1;

    // Check if more steps remain in tour sequence
    if (nextStep < allSteps.length) {
      const nextStepData = allSteps[nextStep];
      // Normalize pathname by removing trailing slash (except root)
      const currentPage =
        pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

      // Handle cross-page navigation for steps requiring different routes
      if (nextStepData.page !== "*" && nextStepData.page !== currentPage) {
        // Save step progression state before navigation to maintain tour context
        setCurrentTourStep(nextStep);
        // Navigate to required page for next step
        router.push(nextStepData.page);
      } else {
        // Same page progression - simply advance step counter
        setCurrentTourStep(nextStep);
      }
    } else {
      // No more steps - complete tour and trigger cleanup
      completeTour(activeTour);
    }
  };

  // Effect to handle navigation synchronization during multi-page tours
  // Ensures tour state remains consistent when users navigate between pages
  // Validates that users reach expected pages for route-specific tour steps
  useEffect(() => {
    if (!mounted || !activeTour) return;

    // Get current tour configuration and step data
    const allSteps = TOURS[activeTour];
    const currentStepData = allSteps[currentStep];

    if (!currentStepData) return;

    // Normalize current pathname for consistent comparison
    const normalizedPathname =
      pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

    // Validate navigation completion for page-specific steps
    // Ensures users have successfully navigated to required pages
    if (currentStepData.page !== "*" && currentStepData.page === normalizedPathname) {
      // Check if previous step was a navigation action that triggered this page change
      const prevStep = currentStep > 0 ? allSteps[currentStep - 1] : null;
      if (
        prevStep &&
        "expectedAction" in prevStep &&
        prevStep.expectedAction === "navigate-to-create-company"
      ) {
        // Navigation completed - step advancement already handled in action handler
        // This validates the navigation was successful
      }
    }
  }, [pathname, activeTour, mounted, currentStep]);

  // Main effect for tour event handling and user interaction coordination
  // Sets up comprehensive event listeners for tour progression and user actions
  // Manages both programmatic and user-driven tour advancement
  useEffect(() => {
    if (!mounted || !activeTour) return;

    // Handler for custom tour action events dispatched by user interactions
    // Processes specific actions like navigation clicks and form submissions
    const handleTourAction = (e: CustomEvent) => {
      const { action } = e.detail;
      const allSteps = TOURS[activeTour];
      const currentStepData = allSteps[currentStep];

      // Validate that current step expects this specific action
      if (
        currentStepData &&
        "expectedAction" in currentStepData &&
        currentStepData.expectedAction === action
      ) {
        // Handle navigation actions with immediate step advancement
        // These actions trigger page changes that are handled separately
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

        // Handle company selector actions with timing delay
        // Allows dropdown animation to complete before step advancement
        if (action === "click-company-selector" || action === "click-company-selector-for-tour") {
          // Wait for dropdown to open and stabilize before proceeding
          setTimeout(() => {
            handleStepProgressionRef.current?.();
          }, 500);
          return;
        }
      }
    };

    // Handler for programmatic step advancement (e.g., from tooltip next button)
    // Provides manual control over tour progression independent of user actions
    const handleNextStep = () => {
      handleStepProgressionRef.current?.();
    };

    // Global click handler for automatic action detection on interactive tour steps
    // Monitors all DOM clicks to detect when users interact with highlighted elements
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const allSteps = TOURS[activeTour];
      const currentStepData = allSteps[currentStep];

      // Only process clicks for interactive steps that wait for user action
      if (
        !currentStepData ||
        !("waitForAction" in currentStepData) ||
        !currentStepData.waitForAction
      ) {
        return;
      }

      // Check if clicked element matches the expected target selector
      const expectedTarget = currentStepData.target;
      const clickedElement = target.closest(expectedTarget);

      if (clickedElement) {
        // Dispatch custom action event to trigger step progression
        window.dispatchEvent(
          new CustomEvent("tourAction", {
            detail: { action: currentStepData.expectedAction },
          })
        );
      }
    };

    // Handler for backward navigation through tour steps
    // Supports user review of previous instructions and tour content
    const handlePrevStep = () => {
      if (currentStep > 0) {
        const prevStep = currentStep - 1;
        const allSteps = TOURS[activeTour];
        const prevStepData = allSteps[prevStep];
        const currentPage =
          pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

        // Handle cross-page navigation for previous steps on different routes
        if (prevStepData.page !== "*" && prevStepData.page !== currentPage) {
          // Save step state before navigation to maintain tour context
          setCurrentTourStep(prevStep);
          router.push(prevStepData.page);
        } else {
          // Same page - simply decrement step counter
          setCurrentTourStep(prevStep);
        }
      }
    };

    // Register all event listeners for comprehensive tour interaction handling
    // Uses capture phase for click events to ensure proper event interception
    window.addEventListener("tourAction" as any, handleTourAction);
    window.addEventListener("tourNextStep" as any, handleNextStep);
    window.addEventListener("tourPrevStep" as any, handlePrevStep);
    document.addEventListener("click", handleClick, true);

    // Cleanup function to prevent memory leaks and duplicate event handlers
    // Removes all listeners when component unmounts or dependencies change
    return () => {
      window.removeEventListener("tourAction" as any, handleTourAction);
      window.removeEventListener("tourNextStep" as any, handleNextStep);
      window.removeEventListener("tourPrevStep" as any, handlePrevStep);
      document.removeEventListener("click", handleClick, true);
    };
  }, [mounted, activeTour, currentStep, pathname, router, setCurrentTourStep]);
}
