"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePathname } from "next/navigation";
import OnboardingTour from "./OnboardingTour";
import { TOURS } from "./tourDefinitions";
import { useTourState } from "./useTourState";
import { useTourEventHandlers } from "./tourEventHandlers";

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

export default function TourProvider({ children }: TourProviderProps) {
  const pathname = usePathname();
  
  const {
    activeTour,
    currentStep,
    completedTours,
    mounted,
    setActiveTour,
    setCompletedTours,
    setCurrentTourStep,
    saveCompletedTours,
    saveActiveTourState,
  } = useTourState();

  const startTour = (tourId: string) => {
    if (!TOURS[tourId]) {
      console.warn(`Tour ${tourId} not found`);
      return;
    }

    setActiveTour(tourId);
    setCurrentTourStep(0);
    saveActiveTourState(tourId, 0);
  };

  const completeTour = (tourId: string) => {
    const newCompleted = new Set(completedTours);
    newCompleted.add(tourId);
    setCompletedTours(newCompleted);
    saveCompletedTours(newCompleted);
    setActiveTour(null);
    setCurrentTourStep(0);
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

  // Use event handlers hook
  useTourEventHandlers({
    activeTour,
    currentStep,
    mounted,
    setCurrentTourStep,
    completeTour,
  });

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
