"use client";

import { useState, useEffect } from "react";
import { Book, X, ArrowRight, CheckCircle, Clock, ChevronRight, Target, Sparkles } from "lucide-react";
import Button from "./Button";
import { useTour } from "@/hooks/useTour";
import { usePathname } from "next/navigation";

interface TourSuggestion {
  step: number;
  flowId: string;
  title: string;
  description: string;
  priority: number;
  context?: string;
}

export default function TourNavigationGuide() {
  const { 
    availableFlows, 
    completedFlows, 
    startFlow, 
    isActive, 
    currentOnboardingStep,
    isOnboardingComplete 
  } = useTour();
  
  const [isVisible, setIsVisible] = useState(false);
  const [suggestion, setSuggestion] = useState<TourSuggestion | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showCount, setShowCount] = useState(0);
  const pathname = usePathname();

  // Enhanced smart suggestion logic based on user context
  const getSmartSuggestion = (): TourSuggestion | null => {
    if (isOnboardingComplete || isDismissed || isActive) {
      return null;
    }

    // Don't show too frequently - limit to 3 times per session
    if (showCount >= 3) {
      return null;
    }

    // Context-aware suggestions based on current page and progress
    const suggestions: TourSuggestion[] = [
      {
        step: 0,
        flowId: "complete-onboarding",
        title: "Welcome to CarbonInsight! 👋",
        description: "Let's get you started with a complete tour of the platform and create your first company.",
        priority: 10,
        context: "First time user"
      },
      {
        step: 1,
        flowId: "company-creation-guided",
        title: "Ready to create your company?",
        description: "Follow our step-by-step guide to set up your company profile correctly.",
        priority: 9,
        context: "Company setup"
      },
      {
        step: 2,
        flowId: "dashboard-and-first-product",
        title: "Explore your dashboard",
        description: "Learn about your sustainability command center and get ready to add products.",
        priority: 8,
        context: "Dashboard exploration"
      },
      {
        step: 3,
        flowId: "product-creation-wizard",
        title: "Create your first product",
        description: "Calculate your first product carbon footprint with our comprehensive wizard.",
        priority: 7,
        context: "Product creation"
      },
      {
        step: 4,
        flowId: "product-management-features",
        title: "Master product management",
        description: "Discover AI insights, export options, and collaboration features.",
        priority: 6,
        context: "Advanced features"
      },
      {
        step: 5,
        flowId: "advanced-features",
        title: "Unlock expert features",
        description: "Learn about audit logs, compliance tools, and professional workflows.",
        priority: 5,
        context: "Expert level"
      }
    ];

    // Find the appropriate suggestion for current step
    const currentSuggestion = suggestions.find(s => s.step === currentOnboardingStep);
    
    // Additional context-based suggestions
    if (!currentSuggestion) {
      // User might have skipped or be on a different path
      if (currentOnboardingStep < 3 && pathname === "/create-company") {
        return suggestions.find(s => s.flowId === "company-creation-guided") || null;
      }
      
      if (currentOnboardingStep < 4 && pathname === "/product-list/product") {
        return suggestions.find(s => s.flowId === "product-creation-wizard") || null;
      }
      
      if (currentOnboardingStep < 5 && pathname === "/product-list") {
        return suggestions.find(s => s.flowId === "product-management-features") || null;
      }
    }

    // Only show if the flow hasn't been completed
    if (currentSuggestion && !completedFlows.has(currentSuggestion.flowId)) {
      return currentSuggestion;
    }

    return null;
  };

  // Update suggestion based on current state
  useEffect(() => {
    const newSuggestion = getSmartSuggestion();
    
    if (newSuggestion && newSuggestion !== suggestion) {
      setSuggestion(newSuggestion);
      setIsVisible(true);
      setShowCount(prev => prev + 1);
      
      // Reset dismiss state for new suggestions
      if (newSuggestion.flowId !== suggestion?.flowId) {
        setIsDismissed(false);
      }
    } else if (!newSuggestion) {
      setIsVisible(false);
    }
  }, [pathname, completedFlows, isActive, currentOnboardingStep, isOnboardingComplete]);

  // Auto-hide after reasonable time, but not too quickly
  useEffect(() => {
    if (isVisible && suggestion) {
      const hideDelay = suggestion.step === 0 ? 60000 : 45000; // Show welcome longer
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, suggestion]);

  // Don't show if conditions aren't met
  if (!suggestion || !isVisible || isActive || isOnboardingComplete) {
    return null;
  }

  const handleStartTour = () => {
    startFlow(suggestion.flowId);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const getProgressPercentage = () => {
    return Math.round((currentOnboardingStep / 6) * 100);
  };

  const getRemainingSteps = () => {
    return Math.max(0, 6 - currentOnboardingStep);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-5 animate-in slide-in-from-bottom-4 duration-500">
        {/* Enhanced Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg">
              <Book size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {suggestion.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Step {currentOnboardingStep + 1} of 6
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • {suggestion.context}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="icon"
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
            ariaLabel="Dismiss suggestion"
          >
            <X size={14} />
          </Button>
        </div>

        {/* Enhanced Content */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {suggestion.description}
        </p>

        {/* Enhanced Progress visualization */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <Target size={12} />
              Onboarding Progress
            </span>
            <span className="font-medium">{currentOnboardingStep}/6 Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${getProgressPercentage()}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Started</span>
            <span>{getProgressPercentage()}%</span>
            <span>Expert</span>
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleStartTour}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-medium shadow-md"
          >
            <Sparkles size={12} />
            Start Tour
            <ArrowRight size={12} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="px-3"
          >
            Later
          </Button>
        </div>

        {/* Enhanced footer with motivation */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {getRemainingSteps() > 0 ? (
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🚀 Just <span className="font-semibold text-blue-600 dark:text-blue-400">{getRemainingSteps()} more steps</span> to become a CarbonInsight expert!
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i < currentOnboardingStep
                        ? "bg-green-500"
                        : i === currentOnboardingStep
                        ? "bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-green-600 dark:text-green-400 text-center">
              🎉 Almost there! One final step to mastery!
            </p>
          )}
        </div>

        {/* Achievement preview */}
        {currentOnboardingStep >= 4 && (
          <div className="mt-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                Achievement unlocked: Advanced User! 🏆
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tour completion celebration component
export function TourCompletionCelebration({ tourName }: { tourName: string }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 right-6 z-50 max-w-sm">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-lg animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-300 text-sm">
              Tour Completed! 🎉
            </h3>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              You've finished the "{tourName}" tour. Great job learning CarbonInsight!
            </p>
          </div>
          <Button
            variant="icon"
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded-full"
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Progress badge for navbar
export function TourProgressBadge() {
  const { availableFlows, completedFlows, currentOnboardingStep, isOnboardingComplete } = useTour();

  if (isOnboardingComplete) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900/20 dark:text-green-400">
        <CheckCircle size={10} />
        Expert
      </span>
    );
  }

  if (currentOnboardingStep === 0) {
    return null;
  }

  const remaining = Math.max(0, 6 - currentOnboardingStep);

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900/20 dark:text-blue-400">
      <Clock size={10} />
      {remaining} tour{remaining !== 1 ? 's' : ''} left
    </span>
  );
}
