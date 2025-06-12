// src/app/components/ui/TourOverlay.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { X, ArrowLeft, ArrowRight, SkipForward, Clock, Target } from "lucide-react";
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
  const [isWaitingForElement, setIsWaitingForElement] = useState(false);
  const [elementCheckAttempts, setElementCheckAttempts] = useState(0);
  const [isDelayed, setIsDelayed] = useState(false);
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const elementWaitTimeoutRef = useRef<NodeJS.Timeout>(null);
  const stepDelayTimeoutRef = useRef<NodeJS.Timeout>(null);

  const currentStep = currentTour?.steps[currentStepIndex];

  // Wait for target element to appear
  const waitForElement = useCallback((selector: string, maxAttempts: number = 50): Promise<Element | null> => {
    return new Promise((resolve) => {
      let attempts = 0;
      
      const checkElement = () => {
        const element = document.querySelector(selector);
        attempts++;
        
        if (element) {
          resolve(element);
        } else if (attempts >= maxAttempts) {
          console.warn(`Tour: Element not found after ${maxAttempts} attempts: ${selector}`);
          resolve(null);
        } else {
          setTimeout(checkElement, 200);
        }
      };
      
      checkElement();
    });
  }, []);

  // Calculate target element position with better error handling
  const calculateTargetPosition = useCallback(async (): Promise<Position | null> => {
    if (!currentStep) return null;

    let element: Element | null = null;

    // If step requires waiting for element, wait for it
    if (currentStep.waitForElement) {
      setIsWaitingForElement(true);
      setElementCheckAttempts(0);
      
      element = await waitForElement(currentStep.target);
      setIsWaitingForElement(false);
      
      if (!element) {
        console.warn(`Tour: Target element not found: ${currentStep.target}`);
        return null;
      }
    } else {
      element = document.querySelector(currentStep.target);
    }

    if (!element) {
      console.warn(`Tour: Target element not found: ${currentStep.target}`);
      return null;
    }

    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    return {
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height,
    };
  }, [currentStep, waitForElement]);

  // Calculate tooltip position with improved logic
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

    // Calculate positions for each placement with better spacing
    const spacing = 20;
    const positions = {
      top: {
        top: targetPos.top - tooltipRect.height - spacing,
        left: targetPos.left + (targetPos.width - tooltipRect.width) / 2,
      },
      bottom: {
        top: targetPos.top + targetPos.height + spacing,
        left: targetPos.left + (targetPos.width - tooltipRect.width) / 2,
      },
      left: {
        top: targetPos.top + (targetPos.height - tooltipRect.height) / 2,
        left: targetPos.left - tooltipRect.width - spacing,
      },
      right: {
        top: targetPos.top + (targetPos.height - tooltipRect.height) / 2,
        left: targetPos.left + targetPos.width + spacing,
      },
    };

    let position = positions[placement as keyof typeof positions];

    // Smart positioning: adjust if tooltip would be outside viewport
    const margin = 16;
    
    if (placement === "top" && position.top < scrollY + margin) {
      placement = "bottom";
      position = positions.bottom;
    } else if (placement === "bottom" && position.top + tooltipRect.height > scrollY + viewportHeight - margin) {
      placement = "top";
      position = positions.top;
    } else if (placement === "left" && position.left < scrollX + margin) {
      placement = "right";
      position = positions.right;
    } else if (placement === "right" && position.left + tooltipRect.width > scrollX + viewportWidth - margin) {
      placement = "left";
      position = positions.left;
    }

    // Final bounds checking
    top = Math.max(scrollY + margin, Math.min(position.top, scrollY + viewportHeight - tooltipRect.height - margin));
    left = Math.max(scrollX + margin, Math.min(position.left, scrollX + viewportWidth - tooltipRect.width - margin));

    return { top, left, placement: placement as TooltipPosition["placement"] };
  }, [currentStep]);

  // Handle step delay
  useEffect(() => {
    if (!isActive || !currentStep) return;

    // Clear any existing delay timeout
    if (stepDelayTimeoutRef.current) {
      clearTimeout(stepDelayTimeoutRef.current);
    }

    if (currentStep.delay) {
      setIsDelayed(true);
      stepDelayTimeoutRef.current = setTimeout(() => {
        setIsDelayed(false);
      }, currentStep.delay);
    } else {
      setIsDelayed(false);
    }

    return () => {
      if (stepDelayTimeoutRef.current) {
        clearTimeout(stepDelayTimeoutRef.current);
      }
    };
  }, [isActive, currentStep]);

  // Update positions when step changes or window resizes
  useEffect(() => {
    if (!isActive || !currentStep || isDelayed) {
      setIsVisible(false);
      return;
    }

    const updatePositions = async () => {
      try {
        const targetPos = await calculateTargetPosition();
        
        if (targetPos) {
          setTargetPosition(targetPos);
          
          // Delay tooltip positioning until after render
          setTimeout(() => {
            const tooltipPos = calculateTooltipPosition(targetPos);
            setTooltipPosition(tooltipPos);
            setIsVisible(true);
          }, 100);
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
          }, 100);
        }
      } catch (error) {
        console.error("Tour positioning error:", error);
        setIsVisible(false);
      }
    };

    updatePositions();

    // Add event listeners with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updatePositions, 300);
    };

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updatePositions, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(resizeTimeout);
      clearTimeout(scrollTimeout);
    };
  }, [isActive, currentStep, isDelayed, calculateTargetPosition, calculateTooltipPosition]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          stopTour();
          break;
        case "ArrowRight":
        case "Enter":
        case " ":
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

  // Scroll target into view with smooth animation
  useEffect(() => {
    if (!targetPosition || !currentStep || isDelayed) return;

    const targetElement = document.querySelector(currentStep.target);
    if (targetElement && targetPosition) {
      // Calculate optimal scroll position
      const elementTop = targetPosition.top - 100; // 100px padding from top
      const elementBottom = targetPosition.top + targetPosition.height + 100;
      const viewportTop = window.pageYOffset;
      const viewportBottom = viewportTop + window.innerHeight;

      // Only scroll if element is not fully visible
      if (elementTop < viewportTop || elementBottom > viewportBottom) {
        window.scrollTo({
          top: Math.max(0, elementTop),
          behavior: "smooth",
        });
      }
    }
  }, [targetPosition, currentStep, isDelayed]);

  // Don't render anything if tour is not active
  if (!isActive || !currentStep) {
    return null;
  }

  // Show loading state for delayed steps
  if (isDelayed) {
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 text-center">
          <Clock className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300">Preparing tour step...</p>
        </div>
      </div>,
      document.body
    );
  }

  // Show waiting state for elements
  if (isWaitingForElement) {
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 text-center">
          <Target className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-bounce" />
          <p className="text-gray-600 dark:text-gray-300">Waiting for page elements...</p>
          <div className="mt-4">
            <Button onClick={stopTour} variant="outline" size="sm">
              Cancel Tour
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (!isVisible) return null;

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
    boxShadow: "0 0 0 4px rgba(194, 0, 22, 0.3), 0 0 20px rgba(194, 0, 22, 0.2)",
    border: "2px solid #c20016",
  } : {};

  const tooltipStyle: React.CSSProperties = tooltipPosition ? {
    position: "absolute",
    top: tooltipPosition.top,
    left: tooltipPosition.left,
    zIndex: 10002,
    maxWidth: "400px",
    minWidth: "320px",
  } : {};

  const getArrowClasses = () => {
    if (!tooltipPosition || tooltipPosition.placement === "center") return "";
    
    const baseClasses = "absolute w-0 h-0 border-8 border-solid";
    const borderColor = "border-white dark:border-gray-800";
    
    switch (tooltipPosition.placement) {
      case "top":
        return `${baseClasses} ${borderColor} border-b-transparent border-l-transparent border-r-transparent top-full left-1/2 transform -translate-x-1/2`;
      case "bottom":
        return `${baseClasses} ${borderColor} border-t-transparent border-l-transparent border-r-transparent bottom-full left-1/2 transform -translate-x-1/2`;
      case "left":
        return `${baseClasses} ${borderColor} border-r-transparent border-t-transparent border-b-transparent left-full top-1/2 transform -translate-y-1/2`;
      case "right":
        return `${baseClasses} ${borderColor} border-l-transparent border-t-transparent border-b-transparent right-full top-1/2 transform -translate-y-1/2`;
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
          className="absolute transition-all duration-300 ease-in-out"
          style={spotlightStyle}
          aria-hidden="true"
        />
      )}

      {/* Tour tooltip */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 relative animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Arrow pointer */}
        <div className={getArrowClasses()} aria-hidden="true" />

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h3
                id="tour-step-title"
                className="text-lg font-semibold text-gray-900 dark:text-white leading-tight"
              >
                {currentStep.title}
              </h3>
              {currentTour && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Step {currentStepIndex + 1} of {currentTour.steps.length}
                  </div>
                  <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                    {currentTour.name}
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="icon"
              onClick={stopTour}
              className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
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
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(((currentStepIndex + 1) / currentTour.steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-500 ease-out"
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
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isLastStep ? (
                  "Finish Tour"
                ) : (
                  <>
                    Next
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span><kbd>Enter</kbd> Next</span>
              {showBackButton && <span><kbd>←</kbd> Back</span>}
              <span><kbd>Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
