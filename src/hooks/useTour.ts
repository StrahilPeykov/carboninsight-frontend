// src/hooks/useTour.ts
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  showSkip?: boolean;
  showBack?: boolean;
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
  action?: {
    type: "click" | "navigate" | "wait";
    target?: string;
    url?: string;
    delay?: number;
  };
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  trigger: "manual" | "first-login" | "no-companies" | "no-products" | "page-visit";
  triggerCondition?: string; // page path for page-visit trigger
  steps: TourStep[];
  priority: number; // higher = more important
}

interface TourContextType {
  isActive: boolean;
  currentTour: Tour | null;
  currentStepIndex: number;
  startTour: (tourId: string) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completedTours: Set<string>;
  availableTours: Tour[];
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// Tour definitions
const TOURS: Tour[] = [
  {
    id: "welcome-first-time",
    name: "Welcome to CarbonInsight",
    description: "Get started with your first company and product",
    trigger: "first-login",
    priority: 10,
    steps: [
      {
        id: "welcome",
        target: "body",
        title: "Welcome to CarbonInsight! 🌱",
        content: "Let's take a quick tour to help you get started with calculating your product carbon footprints and generating Digital Product Passports.",
        placement: "center",
        showSkip: true,
        showBack: false,
      },
      {
        id: "navigation",
        target: "#main-navigation",
        title: "Navigation Bar",
        content: "This is your main navigation. Here you can access your dashboard, manage companies, and view products.",
        placement: "bottom",
      },
      {
        id: "company-selector",
        target: "[aria-label*='Current company']",
        title: "Company Management",
        content: "Select and manage your companies here. You'll need to create a company first before adding products.",
        placement: "bottom",
      },
      {
        id: "create-company-action",
        target: "body",
        title: "Let's Create Your First Company",
        content: "Click 'OK' to navigate to the company creation page where you can set up your first company.",
        placement: "center",
        action: {
          type: "navigate",
          url: "/create-company",
        },
      },
    ],
  },
  {
    id: "company-created-next-steps",
    name: "Company Created - Next Steps",
    description: "Learn what to do after creating your first company",
    trigger: "manual", // We'll trigger this after company creation
    priority: 9,
    steps: [
      {
        id: "company-created",
        target: "body",
        title: "Great! Company Created! 🎉",
        content: "Your company has been successfully created. Now let's add your first product to calculate its carbon footprint.",
        placement: "center",
      },
      {
        id: "dashboard-overview",
        target: "[aria-label='Quick Stats']",
        title: "Your Dashboard",
        content: "This dashboard shows an overview of your companies, products, and pending data sharing requests.",
        placement: "bottom",
      },
      {
        id: "add-product-action",
        target: "body",
        title: "Add Your First Product",
        content: "Let's navigate to add your first product. This is where the carbon footprint calculation begins!",
        placement: "center",
        action: {
          type: "navigate",
          url: "/product-list/product",
        },
      },
    ],
  },
  {
    id: "product-creation-guide",
    name: "Product Creation Walkthrough",
    description: "Learn how to add and configure a new product",
    trigger: "page-visit",
    triggerCondition: "/product-list/product",
    priority: 8,
    steps: [
      {
        id: "product-form-intro",
        target: "body",
        title: "Product Creation Wizard 🏭",
        content: "This multi-step form will guide you through creating a product and calculating its carbon footprint. Each tab represents a different aspect of your product's lifecycle.",
        placement: "center",
      },
      {
        id: "product-info-tab",
        target: "[role='tablist']",
        title: "Step-by-Step Process",
        content: "Follow these tabs in order: Product Info → Bill of Materials → Production Energy → User Energy → Transportation. Each step builds upon the previous one.",
        placement: "bottom",
      },
      {
        id: "product-name-field",
        target: "[name='product_name']",
        title: "Product Information",
        content: "Start by entering your product's basic information. The name and SKU are required fields.",
        placement: "bottom",
      },
      {
        id: "save-and-continue",
        target: "body",
        title: "Save Each Step",
        content: "Remember to save each tab before moving to the next. This ensures your data is preserved as you build your product's carbon footprint profile.",
        placement: "center",
      },
    ],
  },
  {
    id: "product-list-features",
    name: "Product Management Features",
    description: "Explore product list capabilities",
    trigger: "page-visit",
    triggerCondition: "/product-list",
    priority: 7,
    steps: [
      {
        id: "product-list-overview",
        target: "body",
        title: "Your Product Portfolio 📦",
        content: "This is your product management hub. Here you can view, edit, export, and analyze all your products' carbon footprints.",
        placement: "center",
      },
      {
        id: "search-functionality",
        target: "[placeholder*='Search']",
        title: "Search & Filter",
        content: "Quickly find products by name, SKU, or manufacturer. Search requires at least 4 characters.",
        placement: "bottom",
      },
      {
        id: "product-actions",
        target: "tbody tr:first-child",
        title: "Product Actions",
        content: "Each product has multiple actions: Export (for Digital Product Passports), Ask AI (for optimization suggestions), Edit, and Delete.",
        placement: "left",
      },
      {
        id: "ai-feature",
        target: "[aria-label*='Ask AI']",
        title: "AI-Powered Insights ✨",
        content: "Use our AI feature to get personalized recommendations for reducing your product's carbon footprint!",
        placement: "top",
      },
      {
        id: "export-options",
        target: "[aria-label*='Export']",
        title: "Export Digital Product Passports",
        content: "Generate DPPs in multiple formats: AASX, XML, JSON, PDF, and more. Perfect for compliance and supply chain sharing.",
        placement: "top",
      },
    ],
  },
  {
    id: "dashboard-tour",
    name: "Dashboard Overview",
    description: "Understand your dashboard and key metrics",
    trigger: "page-visit",
    triggerCondition: "/dashboard",
    priority: 6,
    steps: [
      {
        id: "dashboard-welcome",
        target: "body",
        title: "Your CarbonInsight Dashboard 📊",
        content: "Your central hub for monitoring companies, products, and sustainability metrics.",
        placement: "center",
      },
      {
        id: "quick-stats",
        target: ".grid-cols-1.md\\:grid-cols-3",
        title: "Quick Statistics",
        content: "Monitor your companies, products, and pending data sharing requests at a glance.",
        placement: "bottom",
      },
      {
        id: "audit-log",
        target: "[aria-label*='Audit Log']",
        title: "Audit Trail",
        content: "Track all changes and access to your data for compliance and security purposes.",
        placement: "top",
      },
    ],
  },
  {
    id: "keyboard-shortcuts",
    name: "Keyboard Shortcuts",
    description: "Learn time-saving keyboard shortcuts",
    trigger: "manual",
    priority: 3,
    steps: [
      {
        id: "shortcuts-intro",
        target: "body",
        title: "Keyboard Shortcuts ⌨️",
        content: "Save time with these helpful keyboard shortcuts that work throughout the application.",
        placement: "center",
      },
      {
        id: "search-shortcut",
        target: "[placeholder*='Search']",
        title: "Quick Search",
        content: "Press '/' to instantly focus any search field on the page.",
        placement: "bottom",
      },
      {
        id: "create-shortcut",
        target: "body",
        title: "Quick Create",
        content: "Press 'N' to quickly create a new product or company based on your current page.",
        placement: "center",
      },
      {
        id: "help-shortcut",
        target: "body",
        title: "Get Help",
        content: "Press '?' to view the full keyboard shortcuts reference and accessibility information.",
        placement: "center",
      },
    ],
  },
];

export function TourProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isActive, setIsActive] = useState(false);
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());

  // Load completed tours from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const saved = localStorage.getItem(`completed_tours_${user.id}`);
      if (saved) {
        setCompletedTours(new Set(JSON.parse(saved)));
      }
    }
  }, [user]);

  // Save completed tours to localStorage
  const saveCompletedTours = useCallback((tours: Set<string>) => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem(`completed_tours_${user.id}`, JSON.stringify([...tours]));
    }
  }, [user]);

  // Check for automatic tour triggers
  useEffect(() => {
    if (!isAuthenticated || isActive || !user) return;

    // Check for first-login trigger
    const hasSeenWelcome = completedTours.has("welcome-first-time");
    if (!hasSeenWelcome) {
      setTimeout(() => startTour("welcome-first-time"), 1000);
      return;
    }

    // Check for page-visit triggers
    const pageVisitTours = TOURS.filter(
      tour => tour.trigger === "page-visit" && 
      tour.triggerCondition === pathname &&
      !completedTours.has(tour.id)
    );

    if (pageVisitTours.length > 0) {
      // Start the highest priority tour
      const tourToStart = pageVisitTours.sort((a, b) => b.priority - a.priority)[0];
      setTimeout(() => startTour(tourToStart.id), 1500);
    }
  }, [pathname, isAuthenticated, user, completedTours, isActive]);

  const startTour = useCallback((tourId: string) => {
    const tour = TOURS.find(t => t.id === tourId);
    if (!tour || isActive) return;

    setCurrentTour(tour);
    setCurrentStepIndex(0);
    setIsActive(true);

    // Announce to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `Starting ${tour.name} tour`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, [isActive]);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTour) return;

    const currentStep = currentTour.steps[currentStepIndex];
    
    // Handle step actions
    if (currentStep.action) {
      const { action } = currentStep;
      
      if (action.type === "navigate" && action.url) {
        stopTour();
        router.push(action.url);
        return;
      } else if (action.type === "click" && action.target) {
        const element = document.querySelector(action.target) as HTMLElement;
        if (element) {
          element.click();
        }
      }
    }

    if (currentStepIndex < currentTour.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Tour completed
      const newCompleted = new Set(completedTours);
      newCompleted.add(currentTour.id);
      setCompletedTours(newCompleted);
      saveCompletedTours(newCompleted);
      stopTour();

      // Announce completion
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = `${currentTour.name} tour completed`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  }, [currentTour, currentStepIndex, completedTours, saveCompletedTours, stopTour, router]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    if (!currentTour) return;

    const newCompleted = new Set(completedTours);
    newCompleted.add(currentTour.id);
    setCompletedTours(newCompleted);
    saveCompletedTours(newCompleted);
    stopTour();
  }, [currentTour, completedTours, saveCompletedTours, stopTour]);

  const value: TourContextType = {
    isActive,
    currentTour,
    currentStepIndex,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    skipTour,
    completedTours,
    availableTours: TOURS,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

// Helper hook for triggering specific tour events
export function useTourTrigger() {
  const { startTour } = useTour();

  const triggerCompanyCreatedTour = useCallback(() => {
    setTimeout(() => startTour("company-created-next-steps"), 2000);
  }, [startTour]);

  const triggerKeyboardShortcutsTour = useCallback(() => {
    startTour("keyboard-shortcuts");
  }, [startTour]);

  return {
    triggerCompanyCreatedTour,
    triggerKeyboardShortcutsTour,
  };
}