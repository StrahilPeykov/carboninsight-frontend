"use client";

import { useState, useEffect } from "react";

export function useTourState() {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

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
