// src/app/components/ui/TourOverlay.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { X, ArrowLeft, ArrowRight, SkipForward } from "lucide-react";
import Button from "./Button";
import { useTour } from "@/hooks/useTour";
import React from "react";

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: "top" | "bottom" | "left" | "right" | "center";
}

export default function TourOverlay() {
  const {
    isActive,
    currentTour,
    currentStepIndex,
    nextStep,
    prevStep,
    skipTour,
    stopTour,
  } = useTour();

  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = currentTour?.steps[currentStepIndex];

  // Calculate target element position
  const calculateTargetPosition = useCallback(() => {
    if (!currentStep) return null;

    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) return null;

    const rect = targetElement.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    return {
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height,
    };
  }, [currentStep]);

  // Calculate tooltip position based on target and placement
  const calculateTooltipPosition = useCallback((targetPos: Position): TooltipPosition => {
    if (!currentStep || !tooltipRef.current) {
      return { top: 0, left: 0, placement: "center" };
    }

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

    let placement = currentStep.placement || "bottom";
    let top = 0;
    let left = 0;

    // Handle center placement (modal-style)
    if (placement === "center") {
      return {
        top: scrollY + (viewportHeight - tooltipRect.height) / 2,
        left: scrollX + (viewportWidth - tooltipRect.width) / 2,
        placement: "center",
      };
    }

    // Calculate positions for each placement
    const positions = {
      top: {
        top: targetPos.top - tooltipRect.height - 16,
        left: targetPos.left + (targetPos.width - tooltipRect.width) / 2,
      },
      bottom: {
        top: targetPos.top + targetPos.height + 16,
        left: targetPos.left + (targetPos.width - tooltipRect.width) / 2,
      },
      left: {
        top: targetPos.top + (targetPos.height - tooltipRect.height) / 2,
        left: targetPos.left - tooltipRect.width - 16,
      },
      right: {
        top: targetPos.top + (targetPos.height - tooltipRect.height) / 2,
        left: targetPos.left + targetPos.width + 16,
      },
    };

    let position = positions[placement as keyof typeof positions];

    // Check if tooltip would be outside viewport and adjust
    if (placement === "top" && position.top < scrollY + 16) {
      placement = "bottom";
      position = positions.bottom;
    } else if (placement === "bottom" && position.top + tooltipRect.height > scrollY + viewportHeight - 16) {
      placement = "top";
      position = positions.top;
    } else if (placement === "left" && position.left < scrollX + 16) {
      placement = "right";
      position = positions.right;
    } else if (placement === "right" && position.left + tooltipRect.width > scrollX + viewportWidth - 16) {
      placement = "left";
      position = positions.left;
    }

    // Ensure tooltip stays within viewport bounds
    top = Math.max(scrollY + 16, Math.min(position.top, scrollY + viewportHeight - tooltipRect.height - 16));
    left = Math.max(scrollX + 16, Math.min(position.left, scrollX + viewportWidth - tooltipRect.width - 16));

    return { top, left, placement: placement as TooltipPosition["placement"] };
  }, [currentStep]);

  // Update positions when step changes or window resizes
  useEffect(() => {
    if (!isActive || !currentStep) {
      setIsVisible(false);
      return;
    }

    const updatePositions = () => {
      const targetPos = calculateTargetPosition();
      if (targetPos) {
        setTargetPosition(targetPos);
        
        // Delay tooltip positioning until after render
        setTimeout(() => {
          const tooltipPos = calculateTooltipPosition(targetPos);
          setTooltipPosition(tooltipPos);
          setIsVisible(true);
        }, 50);
      } else {
        // Target not found, show center overlay
        setTargetPosition(null);
        setTimeout(() => {
          setTooltipPosition({
            top: window.pageYOffset + window.innerHeight / 2 - 200,
            left: window.pageXOffset + window.innerWidth / 2 - 200,
            placement: "center",
          });
          setIsVisible(true);
        }, 50);
      }
    };

    updatePositions();

    // Add event listeners
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions);

    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions);
    };
  }, [isActive, currentStep, calculateTargetPosition, calculateTooltipPosition]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          stopTour();
          break;
        case "ArrowRight":
        case "Enter":
          e.preventDefault();
          nextStep();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (currentStepIndex > 0) {
            prevStep();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, currentStepIndex, nextStep, prevStep, stopTour]);

  // Scroll target into view
  useEffect(() => {
    if (!targetPosition || !currentStep) return;

    const targetElement = document.querySelector(currentStep.target);
    if (targetElement && targetPosition) {
      // Smooth scroll to element with some padding
      const elementTop = targetPosition.top - 100;
      window.scrollTo({
        top: Math.max(0, elementTop),
        behavior: "smooth",
      });
    }
  }, [targetPosition, currentStep]);

  if (!isActive || !currentStep || !isVisible) {
    return null;
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentTour ? currentStepIndex === currentTour.steps.length - 1 : false;
  const showBackButton = currentStep.showBack !== false && !isFirstStep;
  const showSkipButton = currentStep.showSkip !== false;

  const spotlightStyle: React.CSSProperties = targetPosition ? {
    position: "absolute",
    top: targetPosition.top - 8,
    left: targetPosition.left - 8,
    width: targetPosition.width + 16,
    height: targetPosition.height + 16,
    borderRadius: "12px",
    pointerEvents: currentStep.spotlightClicks ? "none" : "auto",
  } : {};

  const tooltipStyle: React.CSSProperties = tooltipPosition ? {
    position: "absolute",
    top: tooltipPosition.top,
    left: tooltipPosition.left,
    zIndex: 10002,
  } : {};

  const getArrowClasses = () => {
    if (!tooltipPosition || tooltipPosition.placement === "center") return "";
    
    const baseClasses = "absolute w-0 h-0 border-8 border-solid";
    
    switch (tooltipPosition.placement) {
      case "top":
        return `${baseClasses} border-white border-b-transparent border-l-transparent border-r-transparent top-full left-1/2 transform -translate-x-1/2`;
      case "bottom":
        return `${baseClasses} border-white border-t-transparent border-l-transparent border-r-transparent bottom-full left-1/2 transform -translate-x-1/2`;
      case "left":
        return `${baseClasses} border-white border-r-transparent border-t-transparent border-b-transparent left-full top-1/2 transform -translate-y-1/2`;
      case "right":
        return `${baseClasses} border-white border-l-transparent border-t-transparent border-b-transparent right-full top-1/2 transform -translate-y-1/2`;
      default:
        return "";
    }
  };

  return ReactDOM.createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10000]"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
      aria-describedby="tour-step-content"
    >
      {/* Spotlight highlighting the target element */}
      {targetPosition && (
        <div
          className="absolute border-4 border-red-500 shadow-lg"
          style={spotlightStyle}
          aria-hidden="true"
        />
      )}

      {/* Tour tooltip */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-full mx-4 relative"
      >
        {/* Arrow pointer */}
        <div className={getArrowClasses()} aria-hidden="true" />

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3
                id="tour-step-title"
                className="text-lg font-semibold text-gray-900 dark:text-white pr-2"
              >
                {currentStep.title}
              </h3>
              {currentTour && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Step {currentStepIndex + 1} of {currentTour.steps.length}
                </div>
              )}
            </div>
            <Button
              variant="icon"
              onClick={stopTour}
              className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              ariaLabel="Close tour"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Content */}
          <div
            id="tour-step-content"
            className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6"
          >
            {currentStep.content}
          </div>

          {/* Progress bar */}
          {currentTour && currentTour.steps.length > 1 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className="bg-red-600 h-1 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStepIndex + 1) / currentTour.steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showSkipButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={skipTour}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
                >
                  <SkipForward size={14} />
                  Skip Tour
                </Button>
              )}

              <Button
                size="sm"
                onClick={nextStep}
                className="flex items-center gap-1"
              >
                {isLastStep ? (
                  "Finish"
                ) : (
                  <>
                    Next
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
