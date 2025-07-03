// Client-side component directive - required for DOM interactions and browser event handling
"use client";

// React core imports for component lifecycle and state management
import React, { useState, useEffect, useRef } from "react";
// Custom hooks for advanced tour functionality and user experience optimization
import { usePositioning } from "./usePositioning";
import { useFocusManagement } from "./useFocusManagement";
// Tour UI components for visual overlay and interactive tooltip elements
import TourSpotlight from "./TourSpotlight";
import TourTooltip from "./TourTooltip";

// TourStep interface defines the structure for individual guided tour steps
// Provides comprehensive configuration options for flexible tour experiences
interface TourStep {
  target: string; // CSS selector or element ID to highlight during this step
  title: string; // Main heading displayed in the tour tooltip
  content: string; // Detailed explanation or instruction text for the step
  placement?: "top" | "bottom" | "left" | "right" | "center"; // Tooltip positioning relative to target
  spotlightPadding?: number; // Additional padding around highlighted element for visual clarity
  waitForAction?: boolean; // Pauses tour progression until user performs expected action
  expectedAction?: string; // Specific action identifier that tour waits for (used with waitForAction)
  allowSkip?: boolean; // Enables skip functionality for this specific step
  allowClickOutside?: boolean; // Permits clicking outside tour area without dismissing
}

// OnboardingTourProps interface for main tour component configuration
// Supports both standalone tours and multi-component tour sequences
interface OnboardingTourProps {
  steps: TourStep[]; // Array of tour steps defining the complete user journey
  onComplete?: () => void; // Callback fired when tour completes successfully
  onSkip?: () => void; // Callback fired when user skips the tour
  currentStepIndex?: number; // External control of current step (for coordinated tours)
  totalSteps?: number; // Total steps across multiple tour components (for progress display)
  globalCurrentStep?: number; // Global step counter for multi-component tour coordination
}

// OnboardingTour component - orchestrates interactive guided tour experience
// Manages step progression, user interactions, and integration with positioning/focus systems
// Supports both standalone operation and coordination with external tour management
export default function OnboardingTour({
  steps,
  onComplete,
  onSkip,
  currentStepIndex = 0,
  totalSteps,
  globalCurrentStep = 0,
}: OnboardingTourProps) {
  // Local step tracking for internal navigation within this tour component
  const [localStep, setLocalStep] = useState(currentStepIndex);
  // Visibility state controls tour rendering and cleanup lifecycle
  const [isVisible, setIsVisible] = useState(true);
  // Ref for tooltip DOM element - used for positioning calculations and focus management
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Computed values for step tracking and display
  // Supports both local-only tours and coordinated multi-component tour sequences
  const totalStepCount = totalSteps || steps.length;
  const displayStepNumber = globalCurrentStep + 1;
  const currentStepData = steps[localStep];
  // Configuration flags derived from current step data with sensible defaults
  const canSkip = currentStepData?.allowSkip !== false;
  const allowClickOutside = currentStepData?.allowClickOutside !== false;
  const isWaitingForAction = currentStepData?.waitForAction;

  // Custom hook for intelligent tooltip positioning relative to target elements
  // Handles viewport boundaries, responsive positioning, and dynamic recalculation
  const { targetRect, targetElement, findTargetElement, getTooltipPosition } = usePositioning(currentStepData);

  // Custom hook for accessibility-focused keyboard navigation and focus management
  // Ensures tour remains accessible via keyboard and screen readers
  useFocusManagement({
    isVisible,
    canSkip,
    onSkip: handleSkip,
    tooltipRef,
  });

  // Effect to synchronize local step state with external step control
  // Enables parent components to control tour progression programmatically
  useEffect(() => {
    setLocalStep(currentStepIndex);
  }, [currentStepIndex]);

  // Effect to locate and prepare target elements for highlighting
  // Implements timing delay to ensure DOM elements are available after navigation
  // Skips targeting for center-placed tooltips which don't require specific elements
  useEffect(() => {
    if (!isVisible || !currentStepData) return;

    // Center placement doesn't require target element positioning
    if (currentStepData.placement === "center") {
      return;
    }

    // Delayed element finding to account for dynamic content and page transitions
    // 150ms delay balances responsiveness with DOM stability
    setTimeout(() => {
      findTargetElement(currentStepData.target);
    }, 150);
  }, [localStep, currentStepData, isVisible, findTargetElement]);

  // Effect to set up interactive action tracking for action-dependent tour steps
  // Enables tour progression based on specific user interactions with target elements
  // Uses custom events for loose coupling between tour system and application logic
  useEffect(() => {
    if (!targetElement || !currentStepData?.waitForAction) return;

    // Handler for capturing user interactions with highlighted elements
    // Dispatches custom events to notify tour system of completed actions
    const handleTargetClick = () => {
      if (currentStepData.expectedAction) {
        // Custom event system allows application to respond to tour-driven interactions
        window.dispatchEvent(
          new CustomEvent("tourAction", {
            detail: { action: currentStepData.expectedAction },
          })
        );
      }
    };

    // Register click listener for action tracking
    targetElement.addEventListener("click", handleTargetClick);
    // Cleanup function prevents memory leaks and duplicate listeners
    return () => targetElement.removeEventListener("click", handleTargetClick);
  }, [targetElement, currentStepData]);

  // Handler for tour step progression - supports both local and global tour coordination
  // Implements conditional logic for action-dependent steps and tour completion
  function handleNext() {
    // Prevent automatic progression when waiting for user action
    if (!currentStepData.waitForAction) {
      // Global tour coordination mode - dispatches events for multi-component tours
      if (totalSteps && globalCurrentStep !== undefined) {
        if (globalCurrentStep < totalSteps - 1) {
          // Signal external tour manager to advance to next step
          window.dispatchEvent(new CustomEvent("tourNextStep"));
        } else {
          // Complete tour when reaching final step in global sequence
          handleComplete();
        }
      } else {
        // Local tour mode - manages step progression internally
        if (localStep < steps.length - 1) {
          setLocalStep(localStep + 1);
        } else {
          // Complete tour when reaching final local step
          handleComplete();
        }
      }
    }
  }

  // Handler for backward navigation through tour steps
  // Provides user control for reviewing previous instructions
  function handlePrevious() {
    if (localStep > 0) {
      setLocalStep(localStep - 1);
    }
  }

  // Handler for tour completion - manages cleanup and callback execution
  // Ensures proper state reset and parent component notification
  function handleComplete() {
    setIsVisible(false);
    onComplete?.();
  }

  // Handler for tour skip functionality - respects step-level skip permissions
  // Provides user escape mechanism while maintaining tour control
  function handleSkip() {
    if (canSkip) {
      setIsVisible(false);
      onSkip?.();
    }
  }

  // Early return for hidden tours or invalid step data
  // Prevents rendering of tour components when not needed
  if (!isVisible || !currentStepData) {
    return null;
  }

  return (
    <>
      <TourSpotlight
        targetRect={targetRect}
        placement={currentStepData.placement}
        spotlightPadding={currentStepData.spotlightPadding}
        allowClickOutside={allowClickOutside}
        canSkip={canSkip}
        onSkip={handleSkip}
      />

      <TourTooltip
        title={currentStepData.title}
        content={currentStepData.content}
        displayStepNumber={displayStepNumber}
        totalStepCount={totalStepCount}
        globalCurrentStep={globalCurrentStep}
        canSkip={canSkip}
        isWaitingForAction={!!isWaitingForAction}
        localStep={localStep}
        stepsLength={steps.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        getTooltipPosition={() => getTooltipPosition(tooltipRef)}
        tooltipRef={tooltipRef}
      />
    </>
  );
}
