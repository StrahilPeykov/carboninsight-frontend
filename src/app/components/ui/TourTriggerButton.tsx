// src/app/components/ui/TourTriggerButton.tsx
"use client";

import { HelpCircle, Play, Sparkles } from "lucide-react";
import Button from "./Button";
import { useTour, useTourTrigger } from "@/hooks/useTour";

interface TourTriggerButtonProps {
  tourId?: string;
  variant?: "help" | "feature" | "inline";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  icon?: boolean;
}

export default function TourTriggerButton({
  tourId,
  variant = "help",
  size = "sm", 
  className = "",
  label,
  icon = true,
}: TourTriggerButtonProps) {
  const { startTour, availableTours, completedTours, isActive } = useTour();
  const { triggerFeatureTour } = useTourTrigger();

  // If no specific tour ID, try to determine from context
  const handleClick = () => {
    if (isActive) return; // Don't start if tour is already active

    if (tourId) {
      startTour(tourId);
    } else if (variant === "feature") {
      // Try to determine feature tour from page context
      const currentPath = window.location.pathname;
      if (currentPath.includes("/product-list/product")) {
        startTour("product-creation-comprehensive");
      } else if (currentPath.includes("/product-list")) {
        startTour("product-list-mastery");
      } else if (currentPath.includes("/dashboard")) {
        startTour("dashboard-advanced");
      }
    }
  };

  // Check if tour exists and is available
  const tour = tourId ? availableTours.find(t => t.id === tourId) : null;
  const isCompleted = tourId ? completedTours.has(tourId) : false;

  // Don't render if tour doesn't exist
  if (tourId && !tour) return null;

  // Different variants
  const getButtonProps = () => {
    switch (variant) {
      case "help":
        return {
          icon: icon ? <HelpCircle size={size === "sm" ? 14 : 16} /> : null,
          text: label || "Help",
          variant: "outline" as const,
          className: `text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 ${className}`,
        };
      
      case "feature":
        return {
          icon: icon ? <Sparkles size={size === "sm" ? 14 : 16} /> : null,
          text: label || (isCompleted ? "Replay Tour" : "Learn Feature"),
          variant: "outline" as const,
          className: `text-purple-600 hover:text-purple-700 border-purple-200 hover:border-purple-300 ${className}`,
        };
        
      case "inline":
        return {
          icon: icon ? <Play size={size === "sm" ? 12 : 14} /> : null,
          text: label || "Quick Tour",
          variant: "primary" as const,
          className: `text-xs ${className}`,
        };
        
      default:
        return {
          icon: icon ? <HelpCircle size={14} /> : null,
          text: label || "Help",
          variant: "outline" as const,
          className: className,
        };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <Button
      onClick={handleClick}
      variant={buttonProps.variant}
      size={size}
      className={`flex items-center gap-1 ${buttonProps.className}`}
      disabled={isActive}
      title={tour ? `Start ${tour.name} tour` : "Start guided tour"}
    >
      {buttonProps.icon}
      <span>{buttonProps.text}</span>
      {isCompleted && variant !== "inline" && (
        <span className="text-xs opacity-60">(Completed)</span>
      )}
    </Button>
  );
}

// Specialized tour trigger for AI features
export function AITourTrigger({ className = "" }: { className?: string }) {
  const { isActive } = useTour();
  const { triggerFeatureTour } = useTourTrigger();
  
  return (
    <button
      onClick={() => !isActive && triggerFeatureTour("ai-assistant")}
      className={`text-xs text-purple-600 hover:text-purple-700 underline ${className}`}
      disabled={isActive}
    >
      Learn about AI features
    </button>
  );
}

// Context-aware tour trigger that appears in various places
export function ContextTourTrigger() {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  
  // Determine which tour to show based on current page
  let tourId = "";
  let label = "";
  
  if (currentPath.includes("/product-list/product")) {
    tourId = "product-creation-comprehensive";
    label = "Product Creation Guide";
  } else if (currentPath.includes("/product-list")) {
    tourId = "product-list-mastery";
    label = "Product Management Tour";
  } else if (currentPath.includes("/dashboard")) {
    tourId = "dashboard-advanced";
    label = "Dashboard Tour";
  } else if (currentPath.includes("/product-data-sharing")) {
    tourId = "data-sharing-collaboration";
    label = "Data Sharing Guide";
  }
  
  if (!tourId) return null;
  
  return (
    <TourTriggerButton
      tourId={tourId}
      variant="feature"
      label={label}
      className="fixed bottom-6 right-6 z-40 shadow-lg"
    />
  );
}
