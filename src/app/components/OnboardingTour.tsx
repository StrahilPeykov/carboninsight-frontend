import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightPadding?: number;
  waitForAction?: boolean;
  expectedAction?: string;
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
  globalCurrentStep = 0
}: OnboardingTourProps) {
  const [localStep, setLocalStep] = useState(currentStepIndex);
  const [isVisible, setIsVisible] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isSearchingForElement, setIsSearchingForElement] = useState(false);

  // Use totalSteps if provided, otherwise use steps.length
  const totalStepCount = totalSteps || steps.length;
  
  // Calculate the actual step number for display
  const displayStepNumber = globalCurrentStep + 1;

  const currentStepData = steps[localStep];

  useEffect(() => {
    setLocalStep(currentStepIndex);
    // Reset states when step changes
    setTargetRect(null);
    setTargetElement(null);
    setIsSearchingForElement(false);
  }, [currentStepIndex]);

  useEffect(() => {
    if (!isVisible || !currentStepData) return;

    const updateTargetPosition = () => {
      if (currentStepData.placement === 'center') {
        setTargetRect(null);
        setTargetElement(null);
        return;
      }

      // Add a small delay to ensure dropdown is open before looking for elements
      const findElement = () => {
        const element = document.querySelector(currentStepData.target) as HTMLElement;
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
          setTargetElement(element);
          
          // Only scroll into view if element is not already visible
          const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (!isInViewport) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center'
            });
          }
        } else {
          console.warn(`Tour target not found: ${currentStepData.target}`);
          setTargetRect(null);
          setTargetElement(null);
        }
      };

      // For dropdown elements, wait a bit longer and retry if not found
      if (currentStepData.target.includes('create-company') || currentStepData.target.includes('data-tour-target')) {
        let retries = 0;
        const maxRetries = 20; // Increase retries for dropdown elements
        setIsSearchingForElement(true);
        
        const tryFindElement = () => {
          const element = document.querySelector(currentStepData.target) as HTMLElement;
          if (element) {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
            setTargetElement(element);
            setIsSearchingForElement(false);
            
            // Only scroll into view if element is not already visible
            const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
            if (!isInViewport) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
              });
            }
          } else if (retries < maxRetries) {
            retries++;
            console.log(`Retrying to find element: ${currentStepData.target} (${retries}/${maxRetries})`);
            setTimeout(tryFindElement, 150); // Slightly longer delay between retries
          } else {
            console.warn(`Tour target not found after ${maxRetries} retries: ${currentStepData.target}`);
            // Keep the tour visible but without highlighting
            setTargetRect(null);
            setTargetElement(null);
            setIsSearchingForElement(false);
          }
        };
        
        // Initial delay before starting to look for dropdown elements
        setTimeout(tryFindElement, 400);
      } else {
        setIsSearchingForElement(false);
        findElement();
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateTargetPosition, 100);
    
    const handleUpdate = () => {
      requestAnimationFrame(updateTargetPosition);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    // Set up mutation observer to watch for DOM changes
    const observer = new MutationObserver(() => {
      updateTargetPosition();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      observer.disconnect();
    };
  }, [localStep, currentStepData, isVisible]);

  // Set up click handler for the target element when waitForAction is true
  useEffect(() => {
    if (!targetElement || !currentStepData?.waitForAction) return;

    const handleTargetClick = () => {
      console.log('Target element clicked, proceeding to next step');
      
      // Check if this matches the expected action
      if (currentStepData.expectedAction) {
        // Dispatch the expected action event
        window.dispatchEvent(new CustomEvent('tourAction', { 
          detail: { action: currentStepData.expectedAction } 
        }));
      }
    };

    targetElement.addEventListener('click', handleTargetClick);

    return () => {
      targetElement.removeEventListener('click', handleTargetClick);
    };
  }, [targetElement, currentStepData]);

  const handleNext = () => {
    if (!currentStepData.waitForAction) {
      // For multi-page tours, we need to tell the provider to advance
      if (totalSteps && globalCurrentStep !== undefined) {
        // This is part of a multi-page tour
        if (globalCurrentStep < totalSteps - 1) {
          // Dispatch event to advance the global tour
          window.dispatchEvent(new CustomEvent('tourNextStep'));
        } else {
          handleComplete();
        }
      } else {
        // Single page tour logic
        if (localStep < steps.length - 1) {
          setLocalStep(localStep + 1);
        } else {
          handleComplete();
        }
      }
    }
  };

  const handlePrevious = () => {
    if (localStep > 0) {
      setLocalStep(localStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip?.();
  };

  const getTooltipPosition = () => {
    if (!targetRect || !tooltipRef.current || currentStepData.placement === 'center') {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 20;
    let position: any = {};

    switch (currentStepData.placement || 'bottom') {
      case 'top':
        position = {
          top: targetRect.top - tooltipRect.height - padding,
          left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        };
        break;
      case 'bottom':
        position = {
          top: targetRect.bottom + padding,
          left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        };
        break;
      case 'left':
        position = {
          top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
          left: targetRect.left - tooltipRect.width - padding,
        };
        break;
      case 'right':
        position = {
          top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
          left: targetRect.right + padding,
        };
        break;
    }

    // Keep tooltip within viewport
    position.top = Math.max(padding, Math.min(position.top, window.innerHeight - tooltipRect.height - padding));
    position.left = Math.max(padding, Math.min(position.left, window.innerWidth - tooltipRect.width - padding));

    return position;
  };

  if (!isVisible || !currentStepData) return null;

  const spotlightPadding = currentStepData.spotlightPadding || 8;
  const isWaitingForAction = currentStepData.waitForAction;

  // Calculate blocking areas around the spotlight
  const getBlockingAreas = () => {
    // Always show blocking areas to prevent clicks outside
    if (!targetRect || currentStepData.placement === 'center') {
      // For center placement or when target not found, block the entire screen but allow skip
      return (
        <div
          className="fixed inset-0 bg-transparent"
          style={{
            pointerEvents: 'auto',
            zIndex: 9997,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isWaitingForAction) {
              handleSkip();
            }
          }}
        />
      );
    }

    const spotlight = {
      top: targetRect.top - spotlightPadding,
      left: targetRect.left - spotlightPadding,
      right: targetRect.right + spotlightPadding,
      bottom: targetRect.bottom + spotlightPadding,
    };

    return (
      <>
        {/* Top blocker */}
        <div
          className="fixed bg-transparent"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: spotlight.top,
            pointerEvents: 'auto',
            zIndex: 9997,
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Only skip on backdrop click if NOT waiting for action
            if (!isWaitingForAction) {
              handleSkip();
            }
          }}
        />
        {/* Bottom blocker */}
        <div
          className="fixed bg-transparent"
          style={{
            top: spotlight.bottom,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'auto',
            zIndex: 9997,
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Only skip on backdrop click if NOT waiting for action
            if (!isWaitingForAction) {
              handleSkip();
            }
          }}
        />
        {/* Left blocker */}
        <div
          className="fixed bg-transparent"
          style={{
            top: spotlight.top,
            left: 0,
            width: spotlight.left,
            height: spotlight.bottom - spotlight.top,
            pointerEvents: 'auto',
            zIndex: 9997,
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Only skip on backdrop click if NOT waiting for action
            if (!isWaitingForAction) {
              handleSkip();
            }
          }}
        />
        {/* Right blocker */}
        <div
          className="fixed bg-transparent"
          style={{
            top: spotlight.top,
            left: spotlight.right,
            right: 0,
            height: spotlight.bottom - spotlight.top,
            pointerEvents: 'auto',
            zIndex: 9997,
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Only skip on backdrop click if NOT waiting for action
            if (!isWaitingForAction) {
              handleSkip();
            }
          }}
        />
      </>
    );
  };

  return (
    <>
      {/* Visual backdrop with spotlight */}
      <div 
        className="fixed inset-0 z-[9996] pointer-events-none"
      >
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && currentStepData.placement !== 'center' && (
                <rect
                  x={targetRect.left - spotlightPadding}
                  y={targetRect.top - spotlightPadding}
                  width={targetRect.width + spotlightPadding * 2}
                  height={targetRect.height + spotlightPadding * 2}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.5)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Click blockers around spotlight */}
      {getBlockingAreas()}

      {/* Simple border around target element */}
      {targetRect && currentStepData.placement !== 'center' && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetRect.top - spotlightPadding - 2,
            left: targetRect.left - spotlightPadding - 2,
            width: targetRect.width + spotlightPadding * 2 + 4,
            height: targetRect.height + spotlightPadding * 2 + 4,
            border: '2px solid #c20016',
            borderRadius: '8px',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md pointer-events-auto"
        style={getTooltipPosition()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Step {displayStepNumber} of {totalStepCount}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
            aria-label="Close tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {currentStepData.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {currentStepData.content}
        </p>

        {/* Show waiting indicator if waiting for action or element */}
        {(isWaitingForAction || isSearchingForElement) && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isSearchingForElement 
                ? 'Waiting for dropdown to open...' 
                : 'Click the highlighted element to continue'}
            </p>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: totalStepCount }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === globalCurrentStep
                  ? 'bg-red-600 w-6'
                  : index < globalCurrentStep
                  ? 'bg-gray-400 w-2'
                  : 'bg-gray-300 dark:bg-gray-600 w-2'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Skip tour
          </button>
          
          <div className="flex gap-2">
            {localStep > 0 && !isWaitingForAction && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            
            {!isWaitingForAction && (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                {localStep === steps.length - 1 && globalCurrentStep === totalStepCount - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
