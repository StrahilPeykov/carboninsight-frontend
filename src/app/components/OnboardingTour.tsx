"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePositioning } from "./usePositioning";
import { useFocusManagement } from "./useFocusManagement";
import TourSpotlight from "./TourSpotlight";
import TourTooltip from "./TourTooltip";

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  spotlightPadding?: number;
  waitForAction?: boolean;
  expectedAction?: string;
  allowSkip?: boolean;
  allowClickOutside?: boolean;
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  currentStepIndex?: number;
  totalSteps?: number;
  globalCurrentStep?: number;
}

export default function OnboardingTour({
  steps,
  onComplete,
  onSkip,
  currentStepIndex = 0,
  totalSteps,
  globalCurrentStep = 0,
}: OnboardingTourProps) {
  const [localStep, setLocalStep] = useState(currentStepIndex);
  const [isVisible, setIsVisible] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const totalStepCount = totalSteps || steps.length;
  const displayStepNumber = globalCurrentStep + 1;
  const currentStepData = steps[localStep];
  const canSkip = currentStepData?.allowSkip !== false;
  const allowClickOutside = currentStepData?.allowClickOutside !== false;
  const isWaitingForAction = currentStepData?.waitForAction;

  // Use positioning hook
  const { targetRect, targetElement, findTargetElement, getTooltipPosition } = usePositioning(currentStepData);

  // Use focus management hook
  useFocusManagement({
    isVisible,
    canSkip,
    onSkip: handleSkip,
    tooltipRef,
  });

  useEffect(() => {
    setLocalStep(currentStepIndex);
  }, [currentStepIndex]);

  // Find target element when step changes
  useEffect(() => {
    if (!isVisible || !currentStepData) return;

    if (currentStepData.placement === "center") {
      return;
    }

    setTimeout(() => {
      findTargetElement(currentStepData.target);
    }, 150);
  }, [localStep, currentStepData, isVisible, findTargetElement]);

  // Set up click handler for target element when waitForAction is true
  useEffect(() => {
    if (!targetElement || !currentStepData?.waitForAction) return;

    const handleTargetClick = () => {
      if (currentStepData.expectedAction) {
        window.dispatchEvent(
          new CustomEvent("tourAction", {
            detail: { action: currentStepData.expectedAction },
          })
        );
      }
    };

    targetElement.addEventListener("click", handleTargetClick);
    return () => targetElement.removeEventListener("click", handleTargetClick);
  }, [targetElement, currentStepData]);

  function handleNext() {
    if (!currentStepData.waitForAction) {
      if (totalSteps && globalCurrentStep !== undefined) {
        if (globalCurrentStep < totalSteps - 1) {
          window.dispatchEvent(new CustomEvent("tourNextStep"));
        } else {
          handleComplete();
        }
      } else {
        if (localStep < steps.length - 1) {
          setLocalStep(localStep + 1);
        } else {
          handleComplete();
        }
      }
    }
  }

  function handlePrevious() {
    if (localStep > 0) {
      setLocalStep(localStep - 1);
    }
  }

  function handleComplete() {
    setIsVisible(false);
    onComplete?.();
  }

  function handleSkip() {
    if (canSkip) {
      setIsVisible(false);
      onSkip?.();
    }
  }

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
