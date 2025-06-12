"use client";

import { useState } from "react";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  RotateCcw, 
  Book, 
  X, 
  HelpCircle,
  Lightbulb,
  Zap
} from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import { useTour } from "@/hooks/useTour";

interface TourManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TourManager({ isOpen, onClose }: TourManagerProps) {
  const { availableTours, completedTours, startTour, isActive } = useTour();
  const [selectedCategory, setSelectedCategory] = useState<"all" | "getting-started" | "features" | "tips">("all");

  if (!isOpen) return null;

  const categorizedTours = {
    "getting-started": availableTours.filter(tour => 
      tour.id.includes("welcome") || tour.id.includes("company-created") || tour.id.includes("product-creation")
    ),
    "features": availableTours.filter(tour => 
      tour.id.includes("product-list") || tour.id.includes("dashboard") || tour.id.includes("export")
    ),
    "tips": availableTours.filter(tour => 
      tour.id.includes("keyboard") || tour.id.includes("shortcuts") || tour.id.includes("tips")
    ),
  };

  const getToursToShow = () => {
    if (selectedCategory === "all") return availableTours;
    return categorizedTours[selectedCategory] || [];
  };

  const getTourIcon = (tourId: string) => {
    if (tourId.includes("welcome") || tourId.includes("company")) return <Lightbulb size={16} />;
    if (tourId.includes("keyboard") || tourId.includes("shortcuts")) return <Zap size={16} />;
    if (tourId.includes("product") || tourId.includes("dashboard")) return <Book size={16} />;
    return <HelpCircle size={16} />;
  };

  const getTourStatus = (tourId: string) => {
    return completedTours.has(tourId) ? "completed" : "available";
  };

  const resetTourProgress = () => {
    if (typeof window !== "undefined") {
      // Get user from auth context or localStorage
      const userDataStr = localStorage.getItem("access_token");
      if (userDataStr) {
        // Extract user ID from token if possible, or use a simpler approach
        const userId = "user"; // Fallback - we might want to get actual user ID
        localStorage.removeItem(`completed_tours_${userId}`);
        window.location.reload(); // Refresh to reset state
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Guided Tours
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Learn CarbonInsight features with interactive guided tours
            </p>
          </div>
          <Button variant="icon" onClick={onClose} ariaLabel="Close tour manager">
            <X size={20} />
          </Button>
        </div>

        {/* Category tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "all", label: "All Tours", count: availableTours.length },
            { id: "getting-started", label: "Getting Started", count: categorizedTours["getting-started"].length },
            { id: "features", label: "Features", count: categorizedTours["features"].length },
            { id: "tips", label: "Tips & Tricks", count: categorizedTours["tips"].length },
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedCategory === category.id
                  ? "border-red-600 text-red-600 dark:text-red-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {category.label}
              <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tours list */}
        <div className="overflow-y-auto max-h-96">
          {getToursToShow().length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Book size={32} className="mx-auto mb-3 opacity-50" />
              <p>No tours in this category</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {getToursToShow()
                .sort((a, b) => b.priority - a.priority)
                .map((tour) => {
                  const status = getTourStatus(tour.id);
                  const isCompleted = status === "completed";

                  return (
                    <div
                      key={tour.id}
                      className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {/* Tour icon and status */}
                      <div className="flex-shrink-0 relative">
                        <div className={`p-2 rounded-lg ${
                          isCompleted 
                            ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        }`}>
                          {getTourIcon(tour.id)}
                        </div>
                        {isCompleted && (
                          <CheckCircle 
                            size={12} 
                            className="absolute -top-1 -right-1 text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 rounded-full"
                          />
                        )}
                      </div>

                      {/* Tour details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {tour.name}
                          </h3>
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle size={10} />
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {tour.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {tour.steps.length} steps
                          </span>
                          <span className="flex items-center gap-1">
                            Priority: {tour.priority}
                          </span>
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="flex-shrink-0">
                        <Button
                          size="sm"
                          variant={isCompleted ? "outline" : "primary"}
                          onClick={() => {
                            startTour(tour.id);
                            onClose();
                          }}
                          disabled={isActive}
                          className="flex items-center gap-1"
                        >
                          {isCompleted ? (
                            <>
                              <RotateCcw size={12} />
                              Replay
                            </>
                          ) : (
                            <>
                              <Play size={12} />
                              Start
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer with stats and reset */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">{completedTours.size}</span> of{" "}
              <span className="font-medium">{availableTours.length}</span> tours completed
            </div>
            
            {completedTours.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetTourProgress}
                className="flex items-center gap-1 text-xs"
              >
                <RotateCcw size={12} />
                Reset Progress
              </Button>
            )}
          </div>

          {/* Progress bar */}
          {availableTours.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Tour Progress
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((completedTours.size / availableTours.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedTours.size / availableTours.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
