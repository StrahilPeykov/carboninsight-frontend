// Custom hook for managing tour state with persistence across browser sessions
// This hook provides a centralized state management solution for the onboarding tour system,
// handling both temporary session state and persistent storage of tour completion data
"use client";

import { useState, useEffect } from "react";

// Central state management hook for the tour system
// Manages tour progression, completion tracking, and browser storage persistence
// Uses a combination of localStorage (persistent) and sessionStorage (session-only) for optimal UX
export function useTourState() {
  // Core tour state: which tour is currently active (null = no active tour)
  // This determines which tour configuration is loaded and displayed
  const [activeTour, setActiveTour] = useState<string | null>(null);
  
  // Current step index within the active tour (0-based indexing)
  // Tracks progression through the tour steps array
  const [currentStep, setCurrentStep] = useState(0);
  
  // Set of tour IDs that have been completed by the user
  // Using Set for O(1) lookup performance when checking completion status
  // Persisted in localStorage to survive browser sessions
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());
  
  // Hydration safety flag to prevent SSR/client mismatch issues
  // Ensures localStorage/sessionStorage access only happens client-side
  const [mounted, setMounted] = useState(false);

  // Mount effect - Initialize component and set up cleanup
  // Critical for preventing memory leaks and ensuring proper tour cleanup
  useEffect(() => {
    setMounted(true);

    // Cleanup function removes tour-active class on component unmount
    // Prevents visual artifacts if component unmounts during active tour
    return () => {
      document.body.classList.remove("tour-active");
    };
  }, []);

  // Storage hydration effect - Load persisted tour state from browser storage
  // Runs only after component mounts to avoid SSR hydration issues
  // Combines localStorage (persistent) and sessionStorage (temporary) strategies
  useEffect(() => {
    if (!mounted) return;

    // Load completed tours from localStorage (survives browser restart)
    // Completed tours should persist across sessions to avoid repetition
    const stored = localStorage.getItem("completedTours");
    if (stored) {
      try {
        setCompletedTours(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error("Failed to parse completed tours:", e);
      }
    }

    // Load active tour state from sessionStorage (clears on browser close)
    // Active tours are intentionally session-only to avoid resuming stale tours
    const activeTourStored = sessionStorage.getItem("activeTour");
    const currentStepStored = sessionStorage.getItem("currentTourStep");

    if (activeTourStored) {
      setActiveTour(activeTourStored);
      setCurrentStep(currentStepStored ? parseInt(currentStepStored, 10) : 0);
      // Restore tour-active class to maintain visual state consistency
      document.body.classList.add("tour-active");
    }
  }, [mounted]);

  // Persistent storage function for completed tours
  // Uses localStorage to maintain completion state across browser sessions
  // Converts Set to Array for JSON serialization compatibility
  const saveCompletedTours = (tours: Set<string>) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("completedTours", JSON.stringify(Array.from(tours)));
    }
  };

  // Session storage function for active tour state
  // Uses sessionStorage for temporary state that clears on browser close
  // Manages both tour ID and step progression, plus visual indicators
  const saveActiveTourState = (tourId: string | null, step: number) => {
    if (typeof window !== "undefined") {
      if (tourId) {
        // Save active tour state and add global tour indicator class
        sessionStorage.setItem("activeTour", tourId);
        sessionStorage.setItem("currentTourStep", step.toString());
        document.body.classList.add("tour-active");
      } else {
        // Clear tour state and remove visual indicators when tour ends
        sessionStorage.removeItem("activeTour");
        sessionStorage.removeItem("currentTourStep");
        document.body.classList.remove("tour-active");
      }
    }
  };

  // Wrapper function for step updates that maintains storage sync
  // Ensures step changes are immediately persisted to sessionStorage
  // Prevents loss of progress during browser navigation or refresh
  const setCurrentTourStep = (step: number) => {
    setCurrentStep(step);
    if (activeTour) {
      saveActiveTourState(activeTour, step);
    }
  };

  return {
    // State
    activeTour,
    currentStep,
    completedTours,
    mounted,

    // Actions
    setActiveTour,
    setCurrentStep,
    setCompletedTours,
    setCurrentTourStep,

    // Utils
    saveCompletedTours,
    saveActiveTourState,
  };
}
