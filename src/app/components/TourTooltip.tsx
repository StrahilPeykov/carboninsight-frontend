// React import for component definition and ref handling
import React from "react";
// Lucide React icons for navigation controls and visual elements
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";

// Comprehensive props interface for TourTooltip component
// Supports both local and global tour coordination with extensive customization options
interface TourTooltipProps {
  // Main heading text displayed in tooltip header
  title: string; 
  // Detailed explanation or instruction text for current step
  content: string; 
  // Human-readable step number (1-based) shown to user
  displayStepNumber: number; 
  // Total number of steps in complete tour sequence
  totalStepCount: number; 
  // Zero-based global step index for multi-component tours
  globalCurrentStep: number; 
  // Whether user is allowed to skip/dismiss current tour step
  canSkip: boolean; 
  // Indicates if step requires user action before progression
  isWaitingForAction: boolean; 
  // Zero-based local step index within current tour component
  localStep: number; 
  // Total number of steps in current local tour component
  stepsLength: number; 
  // Callback function for advancing to next step
  onNext: () => void; 
  // Callback function for returning to previous step
  onPrevious: () => void; 
  // Callback function for skipping/dismissing tour
  onSkip: () => void; 
  // Function that returns positioning styles for tooltip placement
  getTooltipPosition: () => any; 
  // React ref for tooltip DOM element access
  tooltipRef: React.RefObject<HTMLDivElement | null>; 
}

// TourTooltip component renders interactive tooltip with navigation controls
// Provides comprehensive tour step information and user interaction options
// Supports both standalone operation and coordination with multi-component tour systems
// Features accessibility support, progress visualization, and responsive design
export default function TourTooltip({
  // Step title for clear identification
  title, 
  // Step content for detailed guidance
  content, 
  // User-facing step number for progress context
  displayStepNumber, 
  // Total steps for progress calculation
  totalStepCount, 
  // Global position for cross-component coordination
  globalCurrentStep, 
  // Skip permission for user control
  canSkip, 
  // Action requirement flag for conditional UI
  isWaitingForAction, 
  // Local position within current component
  localStep, 
  // Local step count for navigation boundaries
  stepsLength, 
  // Next step handler for progression
  onNext, 
  // Previous step handler for review
  onPrevious, 
  // Skip handler for tour dismissal
  onSkip, 
  // Positioning function for dynamic placement
  getTooltipPosition, 
  // DOM reference for positioning calculations and focus management
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
