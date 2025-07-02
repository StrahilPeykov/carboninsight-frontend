import React from "react";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";

interface TourTooltipProps {
  title: string;
  content: string;
  displayStepNumber: number;
  totalStepCount: number;
  globalCurrentStep: number;
  canSkip: boolean;
  isWaitingForAction: boolean;
  localStep: number;
  stepsLength: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  getTooltipPosition: () => any;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}

export default function TourTooltip({
  title,
  content,
  displayStepNumber,
  totalStepCount,
  globalCurrentStep,
  canSkip,
  isWaitingForAction,
  localStep,
  stepsLength,
  onNext,
  onPrevious,
  onSkip,
  getTooltipPosition,
  tooltipRef,
}: TourTooltipProps) {
  return (
    <div
      ref={tooltipRef}
      className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md pointer-events-auto"
      style={getTooltipPosition()}
      onClick={e => e.stopPropagation()}
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
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
            aria-label="Close tour"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <h3 id="tour-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p id="tour-content" className="text-gray-600 dark:text-gray-300 mb-6">
        {content}
      </p>

      {/* Waiting indicator */}
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
                ? "bg-red-600 w-6"
                : index < globalCurrentStep
                  ? "bg-gray-400 w-2"
                  : "bg-gray-300 dark:bg-gray-600 w-2"
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        {canSkip ? (
          <button
            onClick={onSkip}
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
              onClick={onPrevious}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          )}

          {!isWaitingForAction && (
            <button
              onClick={onNext}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              {localStep === stepsLength - 1 && globalCurrentStep === totalStepCount - 1
                ? "Finish"
                : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
