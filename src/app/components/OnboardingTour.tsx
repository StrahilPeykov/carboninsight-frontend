import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
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
  globalCurrentStep = 0
}: OnboardingTourProps) {
  const [localStep, setLocalStep] = useState(currentStepIndex);
  const [isVisible, setIsVisible] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const scrollPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Use totalSteps if provided, otherwise use steps.length
  const totalStepCount = totalSteps || steps.length;
  
  // Calculate the actual step number for display
  const displayStepNumber = globalCurrentStep + 1;

  const currentStepData = steps[localStep];
  // Keep skip button behavior tied to allowSkip
  const canSkip = currentStepData?.allowSkip !== false;
  // Add new logic for click outside behavior
  const allowClickOutside = currentStepData?.allowClickOutside !== false;

  useEffect(() => {
    setLocalStep(currentStepIndex);
  }, [currentStepIndex]);

  // Prevent scrolling during tour
  useEffect(() => {
    if (!isVisible) return;

    // Store current scroll position
    scrollPositionRef.current = {
      x: window.scrollX,
      y: window.scrollY
    };

    const preventScroll = (e: Event) => {
      // Allow scrolling only if we're programmatically scrolling to an element
      if (!targetElement) return;
      
      e.preventDefault();
      window.scrollTo(scrollPositionRef.current.x, scrollPositionRef.current.y);
    };

    // Disable scrolling
    document.body.style.overflow = 'hidden';
    window.addEventListener('scroll', preventScroll, { passive: false });
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('scroll', preventScroll);
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [isVisible, targetElement]);

  // Focus trap
  useEffect(() => {
    if (!isVisible || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const focusableElements = tooltip.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    // Focus the tooltip initially
    tooltip.focus();
    document.addEventListener('keydown', trapFocus);

    return () => {
      document.removeEventListener('keydown', trapFocus);
    };
  }, [isVisible, localStep]);

  // Better element finding with MutationObserver
  const findTargetElement = useCallback((target: string) => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const attemptFind = () => {
      // Try multiple selectors if comma-separated
      const selectors = target.split(',').map(s => s.trim());
      let element: HTMLElement | null = null;
      
      for (const selector of selectors) {
        try {
          element = document.querySelector(selector) as HTMLElement;
          if (element) break;
        } catch (error) {
          console.warn(`Invalid selector: ${selector}`, error);
          continue;
        }
      }
      
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        setTargetElement(element);
        
        // Scroll into view if needed
        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!isInViewport) {
          scrollPositionRef.current = {
            x: window.scrollX,
            y: window.scrollY
          };
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
          
          // Update scroll position after scrolling
          setTimeout(() => {
            scrollPositionRef.current = {
              x: window.scrollX,
              y: window.scrollY
            };
          }, 500);
        }
        return true;
      }
      return false;
    };

    // Try to find immediately
    if (!attemptFind()) {
      // If not found, set up observer to watch for the element
      // But don't clear the target immediately - keep overlay visible
      console.log(`Tour target not found immediately: ${target}, setting up observer...`);
      
      observerRef.current = new MutationObserver(() => {
        if (attemptFind() && observerRef.current) {
          observerRef.current.disconnect();
          console.log(`Tour target found via observer: ${target}`);
        }
      });

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });

      // Timeout fallback - after 5 seconds, if still not found, show as center placement
      setTimeout(() => {
        if (observerRef.current) {
          observerRef.current.disconnect();
          console.warn(`Tour target not found after timeout: ${target}, showing center placement`);
          
          // Don't clear target - just set to null rect to show center placement
          setTargetRect(null);
          setTargetElement(null);
        }
      }, 5000);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || !currentStepData) return;

    console.log('OnboardingTour: Finding target element:', currentStepData.target);

    if (currentStepData.placement === 'center') {
      console.log('OnboardingTour: Center placement, no target needed');
      setTargetRect(null);
      setTargetElement(null);
      return;
    }

    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      findTargetElement(currentStepData.target);
    }, 100);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [localStep, currentStepData, isVisible, findTargetElement]);

  // Update position on window events
  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => {
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
      }
    };

    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetElement]);

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
    if (canSkip) {
      setIsVisible(false);
      onSkip?.();
    }
  };

  const getTooltipPosition = () => {
    console.log('OnboardingTour: Getting tooltip position', {
      hasTargetRect: !!targetRect,
      placement: currentStepData.placement,
      hasTooltip: !!tooltipRef.current
    });

    if (!targetRect || !tooltipRef.current || currentStepData.placement === 'center') {
      console.log('OnboardingTour: Using center positioning');
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

    console.log('OnboardingTour: Calculated position:', position);
    return position;
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only allow Escape if skip is allowed
      if (e.key === "Escape" && canSkip) {
        handleSkip();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, canSkip]);

  if (!isVisible || !currentStepData) {
    console.log('OnboardingTour: Not visible or no step data');
    return null;
  }

  console.log('OnboardingTour: Rendering tour step:', {
    title: currentStepData.title,
    target: currentStepData.target,
    placement: currentStepData.placement,
    hasTargetRect: !!targetRect,
    hasTargetElement: !!targetElement
  });

  const spotlightPadding = currentStepData.spotlightPadding || 8;
  const isWaitingForAction = currentStepData.waitForAction;

  // Calculate blocking areas around the spotlight
  const getBlockingAreas = () => {
    // Always show blocking areas to prevent clicks outside
    if (!targetRect || currentStepData.placement === 'center') {
      console.log('OnboardingTour: Rendering full-screen blocker (center or no target)');
      // For center placement or when target not found, block the entire screen
      return (
        <div
          className="fixed inset-0 bg-transparent"
          style={{
            pointerEvents: 'auto',
            zIndex: 9997,
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('OnboardingTour: Full-screen blocker clicked');
            // Only skip if click outside is allowed AND skip is allowed
            if (allowClickOutside && canSkip) {
              handleSkip();
            }
          }}
        />
      );
    }

    console.log('OnboardingTour: Rendering spotlight blockers around target');
    const spotlight = {
      top: targetRect.top - spotlightPadding,
      left: targetRect.left - spotlightPadding,
      right: targetRect.right + spotlightPadding,
      bottom: targetRect.bottom + spotlightPadding,
    };

    const handleBlockerClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log('OnboardingTour: Spotlight blocker clicked');
      // Only skip if click outside is allowed AND skip is allowed
      if (allowClickOutside && canSkip) {
        handleSkip();
      }
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
          onClick={handleBlockerClick}
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
          onClick={handleBlockerClick}
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
          onClick={handleBlockerClick}
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
          onClick={handleBlockerClick}
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
        tabIndex={-1}
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Step {displayStepNumber} of {totalStepCount}
            </span>
          </div>
          {canSkip && (
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
              aria-label="Close tour"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <h3 id="tour-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {currentStepData.title}
        </h3>
        <p id="tour-content" className="text-gray-600 dark:text-gray-300 mb-6">
          {currentStepData.content}
        </p>

        {/* Show waiting indicator if waiting for action */}
        {isWaitingForAction && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Click the highlighted element to continue
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
          {canSkip ? (
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip tour
            </button>
          ) : (
            <div />
          )}
          
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
