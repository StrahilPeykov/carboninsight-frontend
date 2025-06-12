"use client";

import { useState, useEffect } from "react";
import { Book, X, ArrowRight, CheckCircle, Clock } from "lucide-react";
import Button from "./Button";
import { useTour } from "@/hooks/useTour";
import { usePathname } from "next/navigation";

interface TourSuggestion {
  id: string;
  title: string;
  description: string;
  path?: string;
  priority: number;
}

export default function TourNavigationGuide() {
  const { availableTours, completedTours, startTour, isActive } = useTour();
  const [isVisible, setIsVisible] = useState(false);
  const [suggestion, setSuggestion] = useState<TourSuggestion | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const pathname = usePathname();

  // Define smart suggestions based on user state and current page
  const getSmartSuggestion = (): TourSuggestion | null => {
    // Don't show if user has completed most tours or dismissed
    if (completedTours.size >= availableTours.length - 2 || isDismissed || isActive) {
      return null;
    }

    // Welcome tour for complete beginners
    if (completedTours.size === 0) {
      return {
        id: "welcome-first-time",
        title: "New to CarbonInsight?",
        description: "Take a quick tour to learn the basics and get started with your first company.",
        priority: 10,
      };
    }

    // Company creation guide
    if (pathname === "/create-company" && !completedTours.has("company-creation-guide")) {
      return {
        id: "company-creation-guide",
        title: "Setting up your company?",
        description: "Let us guide you through the company creation process step by step.",
        priority: 9,
      };
    }

    // Product creation for users on the product page
    if (pathname.includes("/product-list/product") && !completedTours.has("product-creation-comprehensive")) {
      return {
        id: "product-creation-comprehensive",
        title: "Creating your first product?",
        description: "Learn how to calculate carbon footprints with our step-by-step wizard.",
        priority: 8,
      };
    }

    // Product management for users with products
    if (pathname === "/product-list" && !completedTours.has("product-list-mastery")) {
      return {
        id: "product-list-mastery",
        title: "Explore product features",
        description: "Discover AI insights, export options, and advanced product management.",
        priority: 7,
      };
    }

    // Dashboard features for returning users
    if (pathname === "/dashboard" && !completedTours.has("dashboard-advanced") && completedTours.size >= 2) {
      return {
        id: "dashboard-advanced", 
        title: "Master your dashboard",
        description: "Learn about metrics, audit logs, and advanced dashboard features.",
        priority: 6,
      };
    }

    // Keyboard shortcuts for power users
    if (completedTours.size >= 3 && !completedTours.has("keyboard-shortcuts-pro")) {
      return {
        id: "keyboard-shortcuts-pro",
        title: "Work faster with shortcuts",
        description: "Learn keyboard shortcuts to become a CarbonInsight power user.",
        priority: 5,
      };
    }

    return null;
  };

  // Update suggestion based on current state
  useEffect(() => {
    const newSuggestion = getSmartSuggestion();
    setSuggestion(newSuggestion);
    setIsVisible(!!newSuggestion);
  }, [pathname, completedTours, isActive, isDismissed]);

  // Auto-hide after some time to not be annoying
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 30000); // Hide after 30 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Don't render if no suggestion or not visible
  if (!suggestion || !isVisible || isActive) {
    return null;
  }

  const handleStartTour = () => {
    startTour(suggestion.id);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Book size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {suggestion.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Guided Tour
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  • 2-3 min
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

        {/* Content */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {suggestion.description}
        </p>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Tour Progress</span>
            <span>{completedTours.size}/{availableTours.length}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${(completedTours.size / availableTours.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleStartTour}
            className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
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
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg animate-in slide-in-from-top-4 duration-500">
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
  const { availableTours, completedTours } = useTour();

  if (completedTours.size === 0 || completedTours.size >= availableTours.length) {
    return null;
  }

  const remaining = availableTours.length - completedTours.size;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900/20 dark:text-blue-400">
      <Clock size={10} />
      {remaining} tour{remaining > 1 ? 's' : ''} left
    </span>
  );
}
