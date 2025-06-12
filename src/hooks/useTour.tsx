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
  waitForElement?: boolean; // Wait for element to appear
  delay?: number; // Delay before showing step
  action?: {
    type: "click" | "navigate" | "wait" | "focus";
    target?: string;
    url?: string;
    delay?: number;
  };
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  trigger: "manual" | "first-login" | "company-created" | "page-visit" | "feature-discovery";
  triggerCondition?: string; // page path for page-visit trigger
  steps: TourStep[];
  priority: number; // higher = more important
  prerequisites?: string[]; // Required completed tours
  cooldown?: number; // Minimum time between auto-triggers (in ms)
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
  triggerCompanyCreatedTour: () => void;
  triggerFeatureTour: (featureId: string) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// Enhanced tour definitions
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
        content: "Welcome to the future of sustainable manufacturing! CarbonInsight helps you calculate product carbon footprints and generate Digital Product Passports. Let's get you started with a quick tour.",
        placement: "center",
        showSkip: true,
        showBack: false,
      },
      {
        id: "navigation-overview",
        target: "#main-navigation",
        title: "Your Navigation Hub",
        content: "This is your main navigation bar. From here you can access your dashboard, manage companies, view products, and access your account settings.",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "company-concept",
        target: "body",
        title: "Understanding Companies",
        content: "In CarbonInsight, you start by creating a Company profile. This represents your business and will contain all your products and their carbon footprint data.",
        placement: "center",
      },
      {
        id: "lets-create-company",
        target: "body",
        title: "Create Your First Company",
        content: "Ready to get started? Let's create your first company profile. When you finish this tour, we'll guide you to the company creation page and continue with the next steps!",
        placement: "center",
      },
    ],
  },
  {
    id: "company-creation-guide",
    name: "Company Creation Guide",
    description: "Learn how to set up your company profile",
    trigger: "manual", // Changed from page-visit to manual to prevent auto-trigger
    priority: 9,
    steps: [
      {
        id: "company-form-intro",
        target: "body",
        title: "Setting Up Your Company 🏢",
        content: "Great! Now let's set up your company profile. This information will be used in your Digital Product Passports and for regulatory compliance.",
        placement: "center",
        delay: 1000,
      },
      {
        id: "company-name-field",
        target: "input[name='name']",
        title: "Business Name",
        content: "Enter your official business name exactly as it appears on your registration documents.",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "vat-field",
        target: "input[name='vat_number']",
        title: "VAT Number",
        content: "Your VAT number is required for EU compliance and will appear in Digital Product Passports.",
        placement: "bottom",
      },
      {
        id: "registration-field",
        target: "input[name='business_registration_number']",
        title: "Registration Number",
        content: "This is your business registration number from the commercial register.",
        placement: "bottom",
      },
      {
        id: "submit-company",
        target: "button[type='submit']",
        title: "Create Your Company",
        content: "Once you've filled in all the details, click this button to create your company. After creation, we'll automatically continue with the next tour to show you your dashboard and how to add products!",
        placement: "top",
      },
    ],
  },
  {
    id: "company-created-success",
    name: "Company Created - Next Steps",
    description: "Learn what to do after creating your company",
    trigger: "company-created",
    priority: 8,
    steps: [
      {
        id: "company-success",
        target: "body",
        title: "Congratulations! 🎉",
        content: "Your company has been successfully created! You're now ready to start adding products and calculating their carbon footprints.",
        placement: "center",
        delay: 2000,
      },
      {
        id: "dashboard-intro",
        target: "body",
        title: "Welcome to Your Dashboard",
        content: "This is your command center. Here you can see an overview of your companies, products, and data sharing requests. Think of it as your sustainability mission control!",
        placement: "center",
      },
      {
        id: "quick-stats",
        target: ".grid-cols-1.md\\:grid-cols-3",
        title: "Quick Statistics",
        content: "These cards show key metrics at a glance: your companies, products, and any pending data sharing requests from suppliers or customers.",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "next-step-products",
        target: "body",
        title: "Ready for Your First Product?",
        content: "Now that your company is set up, the next step is to add your first product and calculate its carbon footprint. When you finish this tour, we'll take you to the product creation wizard and continue guiding you through the process!",
        placement: "center",
      },
    ],
  },
  {
    id: "product-creation-comprehensive",
    name: "Product Creation Walkthrough",
    description: "Complete guide to adding and configuring a new product",
    trigger: "manual", // Changed to manual to prevent auto-trigger
    priority: 7,
    cooldown: 300000, // 5 minutes
    steps: [
      {
        id: "product-wizard-intro",
        target: "body",
        title: "Product Carbon Footprint Wizard 🏭",
        content: "Welcome to the product creation wizard! This process will guide you through calculating your product's complete carbon footprint across its entire lifecycle.",
        placement: "center",
        delay: 1000,
      },
      {
        id: "tab-overview",
        target: "[role='tablist']",
        title: "The Five-Step Process",
        content: "We'll walk through 5 key areas: Product Info → Bill of Materials → Production Energy → User Energy → Transportation. Each step builds your complete carbon profile.",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "product-info-importance",
        target: "[name='product_name']",
        title: "Product Information",
        content: "Start with basic product details. The product name and SKU are required - these will appear in your Digital Product Passport.",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "save-workflow",
        target: "body",
        title: "Save As You Go 💾",
        content: "Important: Save each tab before moving to the next! This preserves your data and unlocks the next step in the calculation process.",
        placement: "center",
      },
      {
        id: "lifecycle-thinking",
        target: "body",
        title: "Complete Your First Product",
        content: "Work through all the tabs to create your first product. Once you have products, you can explore the product management features, AI insights, and export options. Take your time - we'll be here when you're ready for the next level!",
        placement: "center",
      },
    ],
  },
  {
    id: "product-list-mastery",
    name: "Product Management Features",
    description: "Master your product portfolio management",
    trigger: "manual", // Changed to manual to prevent auto-trigger
    priority: 6,
    cooldown: 600000, // 10 minutes
    steps: [
      {
        id: "product-portfolio-intro",
        target: "body",
        title: "Your Product Portfolio 📦",
        content: "This is mission control for your products! Here you can view, analyze, export, and get AI insights for all your products' carbon footprints.",
        placement: "center",
        delay: 1500,
      },
      {
        id: "search-mastery",
        target: "[placeholder*='Search']",
        title: "Smart Search",
        content: "Quickly find products by name, SKU, or manufacturer. Pro tip: Search requires at least 4 characters for precise results.",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "emissions-display",
        target: "tbody tr:first-child td:nth-child(4)",
        title: "Carbon Footprint Data",
        content: "Each product shows its total PCF (Product Carbon Footprint) in kg CO₂e. Click the info icon for lifecycle stage breakdowns.",
        placement: "left",
        waitForElement: true,
      },
      {
        id: "ai-insights-feature",
        target: "button:has(.w-3.h-3.text-purple-500)",
        title: "AI-Powered Optimization ✨",
        content: "This is where the magic happens! Our AI analyzes your product data and suggests specific actions to reduce carbon footprint.",
        placement: "top",
        waitForElement: true,
      },
      {
        id: "export-digital-passport",
        target: "button:has([class*='FileDown'])",
        title: "Digital Product Passports",
        content: "Export your data in multiple formats: AASX for technical integration, XML/JSON for systems, or PDF for reports. All formats are industry-compliant.",
        placement: "top",
        waitForElement: true,
      },
      {
        id: "emissions-tree-view",
        target: "tbody tr:first-child",
        title: "Detailed Analysis",
        content: "Click any product row to dive deep into its emission sources. You'll see a visual tree of all contributing factors.",
        placement: "left",
      },
    ],
  },
  {
    id: "dashboard-advanced",
    name: "Dashboard Deep Dive",
    description: "Understand all dashboard features and metrics",
    trigger: "manual",
    priority: 5,
    cooldown: 900000, // 15 minutes
    steps: [
      {
        id: "dashboard-power-user",
        target: "body",
        title: "Dashboard Mastery 📊",
        content: "You're becoming a CarbonInsight power user! Let's explore advanced dashboard features for tracking your sustainability progress.",
        placement: "center",
        delay: 1000,
      },
      {
        id: "metrics-overview",
        target: ".grid-cols-1.md\\:grid-cols-3",
        title: "Key Performance Indicators",
        content: "These cards are your sustainability KPIs. Track companies managed, products analyzed, and collaboration requests - all indicators of your environmental impact awareness.",
        placement: "bottom",
      },
      {
        id: "data-sharing-collaboration",
        target: "a[href='/product-data-sharing']",
        title: "Supply Chain Collaboration",
        content: "This tracks requests from customers or suppliers to share your emission data. It's key for supply chain transparency and building trust.",
        placement: "top",
      },
      {
        id: "audit-trail-compliance",
        target: "[aria-label*='Audit Log']",
        title: "Compliance & Audit Trail",
        content: "Essential for regulatory compliance! This log tracks all changes to your data, showing who did what and when. Critical for audits and certification.",
        placement: "top",
        waitForElement: true,
      },
    ],
  },
  {
    id: "ai-assistant-deep-dive",
    name: "AI Assistant Features",
    description: "Discover how AI can optimize your carbon footprint",
    trigger: "feature-discovery",
    priority: 4,
    steps: [
      {
        id: "ai-intro",
        target: "body",
        title: "Your AI Sustainability Advisor 🤖",
        content: "Our AI assistant analyzes your product data and provides personalized recommendations to reduce carbon footprint. Let's see how it works!",
        placement: "center",
      },
      {
        id: "ai-data-privacy",
        target: "body",
        title: "Privacy & Security",
        content: "Your data privacy is paramount. The AI analyzes your product information locally and provides recommendations without storing sensitive business data.",
        placement: "center",
      },
      {
        id: "ai-recommendation-types",
        target: "body",
        title: "Types of Recommendations",
        content: "The AI can suggest: alternative materials with lower impact, energy efficiency improvements, supplier optimizations, transportation route improvements, and end-of-life strategies.",
        placement: "center",
      },
      {
        id: "ai-custom-queries",
        target: "body",
        title: "Custom Questions",
        content: "You can ask specific questions like 'How can I reduce transportation emissions?' or 'What's the biggest impact reduction opportunity?' for targeted advice.",
        placement: "center",
      },
    ],
  },
  {
    id: "keyboard-shortcuts-pro",
    name: "Keyboard Shortcuts & Efficiency",
    description: "Work faster with keyboard shortcuts and power user features",
    trigger: "manual",
    priority: 3,
    steps: [
      {
        id: "shortcuts-intro",
        target: "body",
        title: "Efficiency Mastery ⌨️",
        content: "Ready to work at lightning speed? These keyboard shortcuts will make you a CarbonInsight power user!",
        placement: "center",
      },
      {
        id: "universal-search",
        target: "[placeholder*='Search']",
        title: "Universal Search: Press '/'",
        content: "From anywhere in the app, press '/' to instantly focus the search field. Works on product lists, company lists, and more!",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "quick-create",
        target: "body",
        title: "Quick Create: Press 'N'",
        content: "Press 'N' to quickly create new items based on your current context - products when viewing product list, companies when managing companies.",
        placement: "center",
      },
      {
        id: "help-access",
        target: "body",
        title: "Instant Help: Press '?'",
        content: "Press '?' anywhere to access the complete keyboard shortcuts reference and accessibility guide.",
        placement: "center",
      },
      {
        id: "escape-everything",
        target: "body",
        title: "Escape to Freedom: Press 'Esc'",
        content: "The Escape key is your universal 'cancel' - close modals, dismiss dropdowns, cancel forms. Your way out of any situation!",
        placement: "center",
      },
    ],
  },
  {
    id: "data-sharing-collaboration",
    name: "Supply Chain Collaboration",
    description: "Learn how to collaborate with suppliers and customers",
    trigger: "manual",
    priority: 4,
    cooldown: 1200000, // 20 minutes
    steps: [
      {
        id: "collaboration-intro",
        target: "body",
        title: "Supply Chain Transparency 🤝",
        content: "This is where supply chain magic happens! Manage requests to share your emission data with customers and suppliers for complete transparency.",
        placement: "center",
        delay: 1000,
      },
      {
        id: "request-types",
        target: "body",
        title: "Understanding Requests",
        content: "Companies may request access to your product emission data to include in their own calculations. This builds trust and enables accurate scope 3 emissions.",
        placement: "center",
      },
      {
        id: "approval-process",
        target: "body",
        title: "Smart Approval Process",
        content: "You maintain full control. Review each request, verify the requesting company, and approve only legitimate business partners.",
        placement: "center",
      },
      {
        id: "competitive-advantage",
        target: "body",
        title: "Competitive Advantage",
        content: "Sharing verified emission data builds trust with customers and can be a key differentiator in sustainability-focused markets.",
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
  const [lastTriggerTime, setLastTriggerTime] = useState<Record<string, number>>({});

  // Load completed tours from localStorage with proper user ID
  useEffect(() => {
    if (typeof window !== "undefined" && user && user.id) {
      // Clear any old generic user data
      localStorage.removeItem('completed_tours_user');
      localStorage.removeItem('tour_trigger_times_user');
      
      const saved = localStorage.getItem(`completed_tours_${user.id}`);
      const savedTriggerTimes = localStorage.getItem(`tour_trigger_times_${user.id}`);
      
      if (saved) {
        setCompletedTours(new Set(JSON.parse(saved)));
      } else {
        setCompletedTours(new Set());
      }
      
      if (savedTriggerTimes) {
        setLastTriggerTime(JSON.parse(savedTriggerTimes));
      } else {
        setLastTriggerTime({});
      }
    }
  }, [user]);

  // Save completed tours to localStorage
  const saveCompletedTours = useCallback((tours: Set<string>) => {
    if (typeof window !== "undefined" && user && user.id) {
      localStorage.setItem(`completed_tours_${user.id}`, JSON.stringify([...tours]));
    }
  }, [user]);

  const saveTriggerTime = useCallback((tourId: string) => {
    if (typeof window !== "undefined" && user && user.id) {
      const newTriggerTimes = { ...lastTriggerTime, [tourId]: Date.now() };
      setLastTriggerTime(newTriggerTimes);
      localStorage.setItem(`tour_trigger_times_${user.id}`, JSON.stringify(newTriggerTimes));
    }
  }, [lastTriggerTime, user]);

  // Check if a tour can be triggered (respects cooldown)
  const canTriggerTour = useCallback((tour: Tour): boolean => {
    if (completedTours.has(tour.id)) return false;
    if (!tour.cooldown) return true;
    
    const lastTrigger = lastTriggerTime[tour.id];
    if (!lastTrigger) return true;
    
    return Date.now() - lastTrigger > tour.cooldown;
  }, [completedTours, lastTriggerTime]);

  // Check for automatic tour triggers with better logic
  useEffect(() => {
    if (!isAuthenticated || isActive || !user) return;

    const checkTriggers = () => {
      // First-login trigger (highest priority) - only for truly new users
      const welcomeTour = TOURS.find(t => t.trigger === "first-login");
      if (welcomeTour && !completedTours.has(welcomeTour.id) && completedTours.size === 0) {
        setTimeout(() => startTour(welcomeTour.id), 2000);
        return;
      }

      // Don't auto-trigger other tours to prevent loops
      // Users will be guided to continue via post-tour navigation
    };

    checkTriggers();
  }, [pathname, isAuthenticated, user, completedTours, isActive, canTriggerTour]);

  const startTour = useCallback((tourId: string) => {
    const tour = TOURS.find(t => t.id === tourId);
    if (!tour || isActive) return;

    // Check prerequisites
    if (tour.prerequisites) {
      const missingPrerequisites = tour.prerequisites.filter(req => !completedTours.has(req));
      if (missingPrerequisites.length > 0) {
        console.log(`Tour ${tourId} requires: ${missingPrerequisites.join(', ')}`);
        return;
      }
    }

    setCurrentTour(tour);
    setCurrentStepIndex(0);
    setIsActive(true);
    saveTriggerTime(tourId);

    // Announce to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `Starting ${tour.name} tour`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, [isActive, saveTriggerTime, completedTours]);

  const stopTour = useCallback(() => {
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTour) return;

    const currentStep = currentTour.steps[currentStepIndex];
    const isLastStep = currentStepIndex === currentTour.steps.length - 1;
    
    // Handle step actions for non-final steps
    if (!isLastStep && currentStep.action) {
      const { action } = currentStep;
      
      if (action.type === "navigate" && action.url) {
        // Stop current tour before navigation
        stopTour();
        
        // Navigate after a brief delay
        setTimeout(() => {
          router.push(action.url!);
        }, action.delay || 500);
        return;
      } else if (action.type === "click" && action.target) {
        const element = document.querySelector(action.target) as HTMLElement;
        if (element) {
          element.click();
        }
      } else if (action.type === "focus" && action.target) {
        const element = document.querySelector(action.target) as HTMLElement;
        if (element) {
          element.focus();
        }
      }
    }

    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Tour completed - handle post-tour navigation
      const newCompleted = new Set(completedTours);
      newCompleted.add(currentTour.id);
      setCompletedTours(newCompleted);
      saveCompletedTours(newCompleted);
      
      // Handle post-tour navigation and continuation
      handleTourCompletion(currentTour.id);
      
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

  // Handle post-tour navigation and continuation
  const handleTourCompletion = useCallback((completedTourId: string) => {
    const currentPath = pathname;
    
    switch (completedTourId) {
      case "welcome-first-time":
        // Navigate to company creation and start that tour
        setTimeout(() => {
          router.push("/create-company");
          setTimeout(() => {
            startTour("company-creation-guide");
          }, 1500);
        }, 1000);
        break;
        
      case "company-creation-guide":
        // User should create their company first, then we'll trigger the success tour
        // The success tour is triggered by the create company action
        break;
        
      case "company-created-success":
        // Navigate to product creation and start that tour
        setTimeout(() => {
          router.push("/product-list/product");
          setTimeout(() => {
            startTour("product-creation-comprehensive");
          }, 1500);
        }, 1000);
        break;
        
      case "product-creation-comprehensive":
        // Show guidance about continuing when they have products
        if (typeof window !== "undefined") {
          setTimeout(() => {
            const continueDialog = confirm(
              "Great work! You've learned the basics of product creation.\n\n" +
              "Once you've created some products, you can explore:\n" +
              "• Product Management features\n" +
              "• AI-powered optimization\n" +
              "• Digital Product Passport exports\n\n" +
              "Would you like to see the Product Management tour now?"
            );
            
            if (continueDialog) {
              router.push("/product-list");
              setTimeout(() => {
                startTour("product-list-mastery");
              }, 1500);
            }
          }, 2000);
        }
        break;
        
      default:
        // For other tours, just show a completion message
        break;
    }
  }, [pathname, router, startTour]);

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

  // Special trigger functions with better flow management
  const triggerCompanyCreatedTour = useCallback(() => {
    // Only trigger if user completed the welcome tour or is manually starting
    if (completedTours.has("welcome-first-time") || completedTours.size > 0) {
      setTimeout(() => {
        startTour("company-created-success");
      }, 2000);
    }
  }, [startTour, completedTours]);

  const triggerFeatureTour = useCallback((featureId: string) => {
    const tour = TOURS.find(t => t.trigger === "feature-discovery" && t.id.includes(featureId));
    if (tour) {
      startTour(tour.id);
    }
  }, [startTour]);

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
    triggerCompanyCreatedTour,
    triggerFeatureTour,
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
  const { startTour, triggerCompanyCreatedTour, triggerFeatureTour } = useTour();

  return {
    triggerCompanyCreatedTour,
    triggerFeatureTour,
    triggerKeyboardShortcutsTour: () => startTour("keyboard-shortcuts-pro"),
    triggerAIAssistantTour: () => triggerFeatureTour("ai-assistant"),
    triggerDataSharingTour: () => startTour("data-sharing-collaboration"),
  };
}
