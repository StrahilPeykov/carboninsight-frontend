import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

interface TourStep {
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightPadding?: number;
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function OnboardingTour({ steps, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];

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
        
        // Scroll element into view with smooth behavior
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      } else {
        // If target doesn't exist, treat as center placement
        console.warn(`Tour target not found: ${currentStepData.target}`);
        setTargetRect(null);
      }
    };

    // Update position initially and on scroll/resize
    updateTargetPosition();
    
    const handleUpdate = () => {
      requestAnimationFrame(updateTargetPosition);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [currentStep, currentStepData, isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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

  return (
    <>
      {/* Backdrop with spotlight */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
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
            className="pointer-events-auto tour-backdrop"
            onClick={handleSkip}
          />
        </svg>
      </div>

      {/* Animated border around target element */}
      {targetRect && currentStepData.placement !== 'center' && (
        <div
          className="fixed z-[9999] pointer-events-none animate-pulse"
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
        className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md tour-tooltip tour-tooltip-enter"
        style={getTooltipPosition()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
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

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 tour-progress-dot ${
                index === currentStep
                  ? 'bg-red-500 w-8 tour-progress-dot-active'
                  : index < currentStep
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
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors tour-button"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors tour-button"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
