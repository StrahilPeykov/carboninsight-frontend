"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TOURS, TourStep } from "./tourDefinitions";

interface TourEventHandlersProps {
  activeTour: string | null;
  currentStep: number;
  mounted: boolean;
  setCurrentTourStep: (step: number) => void;
  completeTour: (tourId: string) => void;
}

export function useTourEventHandlers({
  activeTour,
  currentStep,
  mounted,
  setCurrentTourStep,
  completeTour,
}: TourEventHandlersProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Handle step progression
  const handleStepProgressionRef = useRef<() => void>(() => {});

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
  }, [mounted, activeTour, currentStep, pathname, router, setCurrentTourStep]);
}
