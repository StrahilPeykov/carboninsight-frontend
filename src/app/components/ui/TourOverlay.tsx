"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { X, ArrowLeft, ArrowRight, SkipForward, Clock, Target, CheckCircle } from "lucide-react";
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
    currentFlow,
    currentStepIndex,
    nextStep,
    prevStep,
    skipFlow,
    stopFlow,
  } = useTour();

  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isWaitingForElement, setIsWaitingForElement] = useState(false);
  const [isDelayed, setIsDelayed] = useState(false);
  const [flowProgress, setFlowProgress] = useState(0);
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const currentStep = currentFlow?.steps[currentStepIndex];

  // Calculate flow progress
  useEffect(() => {
    if (currentFlow) {
      setFlowProgress(((currentStepIndex + 1) / currentFlow.steps.length) * 100);
    }
  }, [currentFlow, currentStepIndex]);

  // Enhanced element waiting with retry logic
  const waitForElement = useCallback(async (selector: string, maxAttempts: number = 30): Promise<Element | null> => {
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

  // Enhanced target position calculation
  const calculateTargetPosition = useCallback(async (): Promise<Position | null> => {
    if (!currentStep) return null;

    let element: Element | null = null;

    if (currentStep.waitForElement) {
      setIsWaitingForElement(true);
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

  // Enhanced tooltip positioning
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

    // Calculate positions with improved spacing
    const spacing = 24;
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

    // Smart positioning with viewport boundary detection
    const margin = 20;
    
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

    // Final boundary clamping
    top = Math.max(scrollY + margin, Math.min(position.top, scrollY + viewportHeight - tooltipRect.height - margin));
    left = Math.max(scrollX + margin, Math.min(position.left, scrollX + viewportWidth - tooltipRect.width - margin));

    return { top, left, placement: placement as TooltipPosition["placement"] };
  }, [currentStep]);

  // Handle step delays
  useEffect(() => {
    if (!isActive || !currentStep) return;

    if (currentStep.delay) {
      setIsDelayed(true);
      const timer = setTimeout(() => {
        setIsDelayed(false);
      }, currentStep.delay);

      return () => clearTimeout(timer);
    } else {
      setIsDelayed(false);
    }
  }, [isActive, currentStep]);

  // Main positioning effect with improved error handling
  useEffect(() => {
    if (!isActive || !currentStep || isDelayed) {
      setIsVisible(false);
      return;
    }

    let isMounted = true;

    const updatePositions = async () => {
      try {
        const targetPos = await calculateTargetPosition();
        
        if (!isMounted) return;
        
        if (targetPos) {
          setTargetPosition(targetPos);
          
          // Delay tooltip positioning to ensure proper rendering
          setTimeout(() => {
            if (!isMounted) return;
            const tooltipPos = calculateTooltipPosition(targetPos);
            setTooltipPosition(tooltipPos);
            setIsVisible(true);
          }, 100);
        } else {
          // No target found, show center modal
          setTargetPosition(null);
          setTimeout(() => {
            if (!isMounted) return;
            setTooltipPosition({
              top: window.pageYOffset + window.innerHeight / 2 - 200,
              left: window.pageXOffset + window.innerWidth / 2 - 250,
              placement: "center",
            });
            setIsVisible(true);
          }, 100);
        }
      } catch (error) {
        console.error("Tour positioning error:", error);
        if (isMounted) {
          setIsVisible(false);
        }
      }
    };

    updatePositions();

    // Improved responsive handling
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (isMounted) updatePositions();
      }, 250);
    };

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (isMounted) updatePositions();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(resizeTimeout);
      clearTimeout(scrollTimeout);
    };
  }, [isActive, currentStep, isDelayed, calculateTargetPosition, calculateTooltipPosition]);

  // Enhanced keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          stopFlow();
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
        case "s":
        case "S":
          if (currentStep?.showSkip !== false) {
            e.preventDefault();
            skipFlow();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, currentStepIndex, nextStep, prevStep, stopFlow, skipFlow, currentStep]);

  // Smart scrolling to keep target visible
  useEffect(() => {
    if (!targetPosition || !currentStep || isDelayed) return;

    const targetElement = document.querySelector(currentStep.target);
    if (targetElement && targetPosition) {
      const elementTop = targetPosition.top - 120;
      const elementBottom = targetPosition.top + targetPosition.height + 120;
      const viewportTop = window.pageYOffset;
      const viewportBottom = viewportTop + window.innerHeight;

      if (elementTop < viewportTop || elementBottom > viewportBottom) {
        window.scrollTo({
          top: Math.max(0, elementTop),
          behavior: "smooth",
        });
      }
    }
  }, [targetPosition, currentStep, isDelayed]);

  // Don't render if not active
  if (!isActive || !currentStep || !currentFlow) {
    return null;
  }

  // Loading states
  if (isDelayed) {
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-sm mx-4 text-center shadow-2xl">
          <Clock className="h-10 w-10 mx-auto mb-4 text-blue-500 animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">Preparing Next Step...</h3>
          <p className="text-gray-600 dark:text-gray-300">Just a moment while we get things ready</p>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full animate-pulse" 
              style={{ width: `${flowProgress}%` }}
            />
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (isWaitingForElement) {
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-sm mx-4 text-center shadow-2xl">
          <Target className="h-10 w-10 mx-auto mb-4 text-purple-500 animate-bounce" />
          <h3 className="text-lg font-semibold mb-2">Looking for Elements...</h3>
          <p className="text-gray-600 dark:text-gray-300">Waiting for the page to load completely</p>
          <div className="mt-4">
            <Button onClick={stopFlow} variant="outline" size="sm">
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
  const isLastStep = currentStepIndex === currentFlow.steps.length - 1;
  const showBackButton = currentStep.showBack !== false && !isFirstStep;
  const showSkipButton = currentStep.showSkip !== false;

  const spotlightStyle: React.CSSProperties = targetPosition ? {
    position: "absolute",
    top: targetPosition.top - 10,
    left: targetPosition.left - 10,
    width: targetPosition.width + 20,
    height: targetPosition.height + 20,
    borderRadius: "16px",
    pointerEvents: currentStep.spotlightClicks ? "none" : "auto",
    boxShadow: "0 0 0 6px rgba(194, 0, 22, 0.4), 0 0 30px rgba(194, 0, 22, 0.3), 0 0 60px rgba(194, 0, 22, 0.1)",
    border: "3px solid #c20016",
    background: "rgba(194, 0, 22, 0.05)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  } : {};

  const tooltipStyle: React.CSSProperties = tooltipPosition ? {
    position: "absolute",
    top: tooltipPosition.top,
    left: tooltipPosition.left,
    zIndex: 10002,
    maxWidth: "420px",
    minWidth: "350px",
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
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
      aria-describedby="tour-step-content"
    >
      {/* Enhanced spotlight with smooth animation */}
      {targetPosition && (
        <div
          className="absolute transition-all duration-500 ease-out"
          style={spotlightStyle}
          aria-hidden="true"
        />
      )}

      {/* Enhanced tour tooltip */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 relative animate-in fade-in zoom-in-95 duration-500"
      >
        {/* Arrow pointer */}
        <div className={getArrowClasses()} aria-hidden="true" />

        {/* Content */}
        <div className="p-6">
          {/* Enhanced header with flow context */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 pr-4">
              <h3
                id="tour-step-title"
                className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2"
              >
                {currentStep.title}
              </h3>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Step {currentStepIndex + 1} of {currentFlow.steps.length}
                  </span>
                  <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                    {currentFlow.name}
                  </div>
                </div>
                {isLastStep && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle size={14} />
                    <span className="text-xs font-medium">Final Step</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="icon"
              onClick={stopFlow}
              className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              ariaLabel="Close tour"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Enhanced content area */}
          <div
            id="tour-step-content"
            className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6 whitespace-pre-line"
          >
            {currentStep.content}
          </div>

          {/* Enhanced progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span className="font-medium">{currentFlow.name}</span>
              <span>{Math.round(flowProgress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${flowProgress}%` }}
              />
            </div>
          </div>

          {/* Enhanced navigation */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft size={16} />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {showSkipButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={skipFlow}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
                >
                  <SkipForward size={16} />
                  Skip Tour
                </Button>
              )}

              <Button
                size="sm"
                onClick={nextStep}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-medium"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle size={16} />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced keyboard hints */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd>
                Next
              </span>
              {showBackButton && (
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">←</kbd>
                  Back
                </span>
              )}
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd>
                Close
              </span>
              {showSkipButton && (
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">S</kbd>
                  Skip
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
