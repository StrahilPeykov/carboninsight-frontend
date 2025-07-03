// Client-side component directive - required for React context and DOM interactions
"use client";

// React core imports for context system and component composition
import React, { createContext, useContext, ReactNode } from "react";
// Next.js navigation hook for pathname-based tour step filtering
import { usePathname } from "next/navigation";
// Tour UI component that renders the actual tour interface
import OnboardingTour from "./OnboardingTour";
// Tour configuration data containing all defined tour sequences
import { TOURS } from "./tourDefinitions";
// Custom hook for tour state management and persistence
import { useTourState } from "./useTourState";
// Custom hook for tour event handling and user interaction coordination
import { useTourEventHandlers } from "./tourEventHandlers";

// Context interface defining the public API for tour management
// Provides methods for tour control and state inspection across the application
interface TourContextType {
  startTour: (tourId: string) => void; // Initiate a specific tour by ID
  completeTour: (tourId: string) => void; // Mark tour as completed and cleanup
  resetTour: (tourId: string) => void; // Remove completion status to allow replay
  isTourCompleted: (tourId: string) => boolean; // Check if specific tour is completed
  isAnyTourActive: boolean; // Global state indicating if any tour is currently running
  currentTourStep: number; // Current step index within active tour
  setCurrentTourStep: (step: number) => void; // Programmatic step control
}

// React context for tour state management - enables tour control from any component
// Provides centralized tour state that persists across page navigation
const TourContext = createContext<TourContextType | undefined>(undefined);

// Props interface for TourProvider component
// Follows standard React provider pattern for component composition
interface TourProviderProps {
  children: ReactNode; // Child components that will have access to tour context
}

// TourProvider component - central orchestrator for all tour functionality
// Manages tour state, coordinates between hooks, and renders active tours
// Should be placed high in component tree to provide application-wide tour access
export default function TourProvider({ children }: TourProviderProps) {
  // Current pathname for route-based tour step visibility determination
  const pathname = usePathname();
  
  // Tour state management hook - handles persistence and state synchronization
  // Provides core state variables and setter functions for tour control
  const {
    activeTour, // Currently active tour ID (null if no tour active)
    currentStep, // Current step index within active tour
    completedTours, // Set of completed tour IDs for tracking user progress
    mounted, // Component mount state to prevent hydration issues
    setActiveTour, // Function to set/clear active tour
    setCompletedTours, // Function to update completed tours set
    setCurrentTourStep, // Function to update current step index
    saveCompletedTours, // Function to persist completed tours to storage
    saveActiveTourState, // Function to persist active tour state to storage
  } = useTourState();

  // Function to initiate a new tour by ID
  // Validates tour exists and sets up initial state for tour progression
  const startTour = (tourId: string) => {
    // Validate that requested tour exists in configuration
    if (!TOURS[tourId]) {
      console.warn(`Tour ${tourId} not found`);
      return;
    }

    // Initialize tour state - set active tour and reset to first step
    setActiveTour(tourId);
    setCurrentTourStep(0);
    // Persist tour state to storage for cross-session continuity
    saveActiveTourState(tourId, 0);
  };

  // Function to complete a tour and update user progress tracking
  // Handles cleanup and state persistence when tour finishes successfully
  const completeTour = (tourId: string) => {
    // Add tour to completed set for progress tracking
    const newCompleted = new Set(completedTours);
    newCompleted.add(tourId);
    setCompletedTours(newCompleted);
    // Persist completion status to storage
    saveCompletedTours(newCompleted);
    
    // Clear active tour state to stop tour rendering
    setActiveTour(null);
    setCurrentTourStep(0);
    // Clear active tour from storage
    saveActiveTourState(null, 0);
  };

  // Function to reset tour completion status - allows tour replay
  // Useful for refresher training or when users want to review features
  const resetTour = (tourId: string) => {
    // Remove tour from completed set
    const newCompleted = new Set(completedTours);
    newCompleted.delete(tourId);
    setCompletedTours(newCompleted);
    // Persist updated completion status
    saveCompletedTours(newCompleted);
  };

  // Function to check if specific tour has been completed
  // Used for conditional UI display and tour availability logic
  const isTourCompleted = (tourId: string) => {
    return completedTours.has(tourId);
  };

  // Initialize tour event handling system
  // Coordinates user interactions, navigation, and step progression
  useTourEventHandlers({
    activeTour,
    currentStep,
    mounted,
    setCurrentTourStep,
    completeTour,
  });

  // Function to determine which tour steps should be displayed on current page
  // Filters tour steps based on route patterns and current pathname
  // Returns only steps that are relevant to the user's current location
  const getCurrentTourSteps = () => {
    // Return empty array if no active tour or tour doesn't exist
    if (!activeTour || !TOURS[activeTour]) {
      return [];
    }

    // Get complete step sequence for active tour
    const allSteps = TOURS[activeTour];
    const currentStepData = allSteps[currentStep];

    // Return empty if current step index is invalid
    if (!currentStepData) {
      return [];
    }

    // Normalize current pathname by removing trailing slash (except root)
    const normalizedPathname =
      pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

    // Normalize step page pattern for consistent comparison
    const stepPage =
      currentStepData.page.endsWith("/") && currentStepData.page !== "/"
        ? currentStepData.page.slice(0, -1)
        : currentStepData.page;

    // Check if current step should be displayed on this page
    // "*" pattern matches any page, otherwise exact pathname match required
    const isStepOnThisPage = stepPage === "*" || stepPage === normalizedPathname;

    // Return empty array if step is not relevant to current page
    if (!isStepOnThisPage) {
      return [];
    }

    // Return single-step array for current step (OnboardingTour expects array)
    return [currentStepData];
  };

  // Handler for tour completion - triggered when user finishes tour sequence
  // Delegates to main completeTour function for consistent state management
  const handleCompleteTour = () => {
    if (activeTour) {
      completeTour(activeTour);
    }
  };

  // Handler for tour skip - triggered when user chooses to skip tour
  // Treats skip as completion to prevent tour from reappearing
  const handleSkipTour = () => {
    if (activeTour) {
      completeTour(activeTour);
    }
  };

  // Calculate computed values for tour rendering
  const stepsToDisplay = getCurrentTourSteps(); // Steps relevant to current page
  const allSteps = activeTour && TOURS[activeTour] ? TOURS[activeTour] : []; // Complete tour sequence
  const shouldShowTour = mounted && activeTour && stepsToDisplay.length > 0; // Render condition

  // Render provider with context value and conditional tour component
  return (
    // Context provider makes tour functions available to all child components
    // Centralizes tour state management and provides consistent API
    <TourContext.Provider
      value={{
        startTour, // Function to initiate tours
        completeTour, // Function to finish tours
        resetTour, // Function to reset completion status
        isTourCompleted, // Function to check completion status
        isAnyTourActive: !!activeTour, // Boolean indicating active tour state
        currentTourStep: currentStep, // Current step index for external reference
        setCurrentTourStep, // Function for programmatic step control
      }}
    >
      {/* Render child components with tour context available */}
      {children}

      {/* Conditionally render active tour component */}
      {/* Only shows when component is mounted, tour is active, and steps are available */}
      {shouldShowTour && (
        <OnboardingTour
          steps={stepsToDisplay} // Current page's relevant steps
          onComplete={handleCompleteTour} // Completion callback
          onSkip={handleSkipTour} // Skip callback
          currentStepIndex={0} // Always 0 since we pass single step
          totalSteps={allSteps.length} // Total steps for progress display
          globalCurrentStep={currentStep} // Global step index for coordination
        />
      )}
    </TourContext.Provider>
  );
}

// Custom hook for accessing tour context
// Provides type-safe access to tour functions with error handling
// Must be used within TourProvider component tree
export function useTour() {
  const context = useContext(TourContext);
  // Throw descriptive error if hook is used outside provider
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
