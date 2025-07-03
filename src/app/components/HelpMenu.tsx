// Client-side component directive - required for useState, useEffect, and DOM interactions
"use client";

// React hooks for component state management and lifecycle
import { useState, useEffect } from "react";
// Lucide React icons for visual elements in the help menu interface
import { HelpCircle, CheckCircle, Play, Sparkles } from "lucide-react";
// Custom tour provider hook for managing interactive guided tours
import { useTour } from "./TourProvider";
// Next.js navigation hook to determine current page/route context
import { usePathname } from "next/navigation";

// HelpMenu component - provides an accessible dropdown interface for interactive guided tours
// Manages tour availability based on user context (company selection, current page)
// Integrates with TourProvider to coordinate tour state across the application
export default function HelpMenu() {
  // State for controlling dropdown menu visibility - manages open/closed state
  const [isOpen, setIsOpen] = useState(false);
  // State tracking whether user has selected a company - affects tour availability
  const [hasCompany, setHasCompany] = useState(false);
  // Current pathname for route-specific tour availability logic
  const pathname = usePathname();
  // Tour management functions from TourProvider context - handles tour lifecycle
  const { startTour, resetTour, isTourCompleted, isAnyTourActive } = useTour();

  // Effect to check user's company selection status from localStorage
  // Runs once on mount to determine tour availability based on user context
  // Uses window check for SSR compatibility in Next.js environment
  useEffect(() => {
    const companyId =
      typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;
    // Convert truthy check to boolean for hasCompany state
    setHasCompany(!!companyId);
  }, []);

  // Tour configuration array - defines available guided tours with metadata
  // Each tour has conditional availability based on user state and current route
  // Supports completion tracking and restart capabilities for user experience
  const tours = [
    {
      // Primary onboarding tour - always available for new users
      id: "main-onboarding",
      name: "Getting Started Tour",
      description: "Complete walkthrough: create your first company and learn the basics",
      available: true, // Always available as entry point for new users
      canRestart: true, // Allows users to replay the tour if needed
    },
    {
      // Product-focused tour - requires company context or specific route
      id: "product-list-tour",
      name: "Product Management Tour",
      description: "Learn to add products, calculate carbon footprints, and export data",
      // Available when user has company OR is on product-list page (for demo purposes)
      available: hasCompany || pathname === "/product-list",
      canRestart: hasCompany || pathname === "/product-list",
    },
    {
      // Company management tour - available from any route for flexibility
      id: "company-tour",
      name: "Company Management Tour",
      description: "Manage multiple companies, users, and settings",
      available: true, // Available from anywhere now
      canRestart: true,
    },
  ];

  // Handler for initiating a specific tour - manages cleanup and tour start sequence
  // Clears any conflicting session storage to ensure clean tour experience
  // Coordinates with TourProvider to reset state before starting new tour
  const handleStartTour = (tourId: string) => {
    // Clear session storage flags that might prevent tour from showing properly
    // These flags track whether users have already seen specific tours
    sessionStorage.removeItem("hasSeenProductListTour");
    sessionStorage.removeItem("hasSeenCompanyListTour");

    // Reset any existing tour state to ensure clean start
    resetTour(tourId);
    // Initiate the requested tour through TourProvider
    startTour(tourId);
    // Close the help menu to focus on tour experience
    setIsOpen(false);
  };

  // Render help menu with dropdown interface and tour management
  return (
    // Relative positioning container for dropdown menu positioning
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        // Responsive styling with dark mode support and smooth transitions
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Help menu"
      >
        <HelpCircle size={16} />
        <span className="hidden sm:inline">Help</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />

          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-red-500" />
              Interactive Tours
            </h3>

            {isAnyTourActive && (
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <Play className="w-3 h-3" />A tour is currently active
                </p>
              </div>
            )}

            <div className="space-y-2">
              {tours.map(tour => {
                // Calculate tour state for conditional rendering and interactions
                const isCompleted = isTourCompleted(tour.id);
                const isAvailable = tour.available;
                const canStart = tour.canRestart || !isCompleted;

                return (
                  // Individual tour button with comprehensive state management
                  // Handles disabled states, hover effects, and accessibility
                  <button
                    key={tour.id}
                    onClick={() => {
                      // Conditional tour start with availability and state checks
                      if (isAvailable && canStart) {
                        handleStartTour(tour.id);
                      }
                    }}
                    // Disabled when tour unavailable, completed (non-restartable), or another tour active
                    disabled={!isAvailable || !canStart || isAnyTourActive}
                    // Dynamic styling based on tour state and availability
                    // Provides clear visual feedback for interactive vs disabled states
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      isAvailable && canStart && !isAnyTourActive
                        ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
                        : "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium">
                          {tour.name}
                          {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {tour.description}
                        </div>
                        {!isAvailable && tour.id === "product-list-tour" && !hasCompany && (
                          <div className="text-xs text-orange-500 mt-1">Create a company first</div>
                        )}
                        {isAnyTourActive && (
                          <div className="text-xs text-blue-500 mt-1">
                            Complete current tour first
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tours guide you through key features step by step. The Getting Started tour will
                help you create your first company.
              </p>
              {isAnyTourActive && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Follow the highlighted elements to complete the current tour.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
