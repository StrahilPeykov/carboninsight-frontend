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

  // Use totalSteps if provided, otherwise use steps.length
  const totalStepCount = totalSteps || steps.length;
  
  // Calculate the actual step number for display
  const displayStepNumber = globalCurrentStep + 1;

  const currentStepData = steps[localStep];

  useEffect(() => {
    setLocalStep(currentStepIndex);
  }, [currentStepIndex]);

  useEffect(() => {
    if (!isVisible || !currentStepData) return;

    const updateTargetPosition = () => {
      if (currentStepData.placement === 'center') {
        setTargetRect(null);
        return;
      }

      const targetElement = document.querySelector(currentStepData.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
        
        // Only scroll into view if element is not already visible
        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!isInViewport) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }
      } else {
        console.warn(`Tour target not found: ${currentStepData.target}`);
        setTargetRect(null);
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

  const handleNext = () => {
    if (!currentStepData.waitForAction) {
      if (localStep < steps.length - 1) {
        setLocalStep(localStep + 1);
      } else {
        handleComplete();
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

  if (!isVisible) return null;

  const spotlightPadding = currentStepData.spotlightPadding || 8;
  const isWaitingForAction = currentStepData.waitForAction;

  return (
    <>
      {/* Backdrop with spotlight */}
      <div 
        className="fixed inset-0 z-[9998]"
        style={{ pointerEvents: isWaitingForAction ? 'none' : 'auto' }}
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
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#spotlight-mask)"
            className="tour-backdrop"
            onClick={!isWaitingForAction ? handleSkip : undefined}
            style={{ pointerEvents: 'auto' }}
          />
        </svg>
      </div>

      {/* Click blocker for everything except the highlighted element */}
      {isWaitingForAction && (
        <div 
          className="fixed inset-0 z-[9999]" 
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            // Prevent clicks from going through
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {/* Cut out hole for the target element */}
          {targetRect && (
            <div
              style={{
                position: 'absolute',
                top: targetRect.top - spotlightPadding,
                left: targetRect.left - spotlightPadding,
                width: targetRect.width + spotlightPadding * 2,
                height: targetRect.height + spotlightPadding * 2,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      )}

      {/* Animated border around target element */}
      {targetRect && currentStepData.placement !== 'center' && (
        <div
          className="fixed z-[9997] pointer-events-none animate-pulse"
          style={{
            top: targetRect.top - spotlightPadding - 2,
            left: targetRect.left - spotlightPadding - 2,
            width: targetRect.width + spotlightPadding * 2 + 4,
            height: targetRect.height + spotlightPadding * 2 + 4,
          }}
        >
          <div className="absolute inset-0 border-2 border-red-500 rounded-lg tour-spotlight-border" />
          <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-ping" />
        </div>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md tour-tooltip tour-tooltip-enter pointer-events-auto"
        style={getTooltipPosition()}
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
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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

        {/* Show waiting indicator if waiting for action */}
        {isWaitingForAction && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <span className="animate-pulse">👆</span>
              Click the highlighted element to continue
            </p>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: totalStepCount }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 tour-progress-dot ${
                index === globalCurrentStep
                  ? 'bg-red-500 w-8 tour-progress-dot-active'
                  : index < globalCurrentStep
                  ? 'bg-red-300'
                  : 'bg-gray-300 dark:bg-gray-600'
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
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors tour-button"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            
            {!isWaitingForAction && (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors tour-button"
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
