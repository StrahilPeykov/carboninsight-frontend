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
  waitForElement?: boolean;
  delay?: number;
  // New: Action to perform when step completes
  onComplete?: {
    type: "navigate" | "wait" | "trigger-event" | "set-data";
    payload?: any;
    delay?: number;
  };
}

export interface TourFlow {
  id: string;
  name: string;
  description: string;
  // Flow management
  autoStart?: boolean; // Should this flow start automatically?
  trigger: "manual" | "first-login" | "company-created" | "page-visit" | "feature-discovery" | "onboarding-complete";
  triggerCondition?: string;
  priority: number;
  prerequisites?: string[];
  // Navigation and flow
  startUrl?: string; // Where should user be when flow starts?
  steps: TourStep[];
  // Post-completion
  nextFlow?: string; // Which flow should run next?
  completionMessage?: string;
  completionAction?: {
    type: "navigate" | "show-message" | "trigger-flow";
    payload?: any;
  };
}

interface TourContextType {
  // Current state
  isActive: boolean;
  currentFlow: TourFlow | null;
  currentStepIndex: number;
  
  // Flow management
  startFlow: (flowId: string, force?: boolean) => void;
  stopFlow: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipFlow: () => void;
  
  // Progress tracking
  completedFlows: Set<string>;
  availableFlows: TourFlow[];
  currentOnboardingStep: number;
  isOnboardingComplete: boolean;
  
  // Special triggers
  triggerOnboardingFlow: () => void;
  triggerFeatureDiscovery: (featureId: string) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// Enhanced tour flows with better navigation
const TOUR_FLOWS: TourFlow[] = [
  {
    id: "complete-onboarding",
    name: "Complete Onboarding",
    description: "Full guided setup from first login to first product",
    trigger: "first-login",
    autoStart: true,
    priority: 10,
    steps: [
      {
        id: "welcome",
        target: "body",
        title: "Welcome to CarbonInsight! 🌱",
        content: "Let's get you set up! This quick guided tour will take you through creating your company, adding your first product, and understanding all the key features. Ready to get started?",
        placement: "center",
        showSkip: false,
        showBack: false,
      },
      {
        id: "navigation-tour",
        target: "#main-navigation",
        title: "Your Navigation Hub",
        content: "This navigation bar is your command center. We'll guide you through each section, but first - let's create your company profile.",
        placement: "bottom",
        waitForElement: true,
        onComplete: {
          type: "navigate",
          payload: "/create-company",
          delay: 1000,
        },
      },
    ],
    nextFlow: "company-creation-guided",
    completionMessage: "Navigation tour complete! Now let's create your company...",
  },
  
  {
    id: "company-creation-guided",
    name: "Company Setup Wizard",
    description: "Guided company creation with validation",
    trigger: "manual",
    priority: 9,
    startUrl: "/create-company",
    steps: [
      {
        id: "company-form-intro",
        target: "body",
        title: "Company Setup 🏢",
        content: "Perfect! Now let's set up your company profile. This information will be used in your Digital Product Passports and ensures regulatory compliance.",
        placement: "center",
        delay: 500,
      },
      {
        id: "business-name-guidance",
        target: "input[name='name']",
        title: "Business Name",
        content: "Enter your official business name exactly as it appears on registration documents. This will appear on all your Digital Product Passports.",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "vat-number-guidance",
        target: "input[name='vat_number']",
        title: "VAT Number",
        content: "Your VAT number is required for EU compliance. Don't worry if you don't have one yet - you can update this later.",
        placement: "bottom",
      },
      {
        id: "registration-guidance",
        target: "input[name='business_registration_number']",
        title: "Registration Number",
        content: "This is your business registration number from the commercial register.",
        placement: "bottom",
      },
      {
        id: "ready-to-create",
        target: "button[type='submit']",
        title: "Create Your Company",
        content: "Great! Once you click this button, your company will be created and we'll continue to the next step - exploring your dashboard and adding your first product.",
        placement: "top",
        onComplete: {
          type: "wait",
          delay: 2000, // Wait for company creation
        },
      },
    ],
    nextFlow: "dashboard-and-first-product",
    completionMessage: "Company created! Let's explore your dashboard...",
  },
  
  {
    id: "dashboard-and-first-product",
    name: "Dashboard & First Product",
    description: "Explore dashboard then create first product",
    trigger: "company-created",
    priority: 8,
    startUrl: "/dashboard",
    steps: [
      {
        id: "company-success-celebration",
        target: "body",
        title: "Congratulations! 🎉",
        content: "Your company is now set up! This is your dashboard - your sustainability command center. Let's explore the key features, then create your first product.",
        placement: "center",
        delay: 1000,
      },
      {
        id: "dashboard-stats-overview",
        target: ".grid-cols-1.md\\:grid-cols-3",
        title: "Your Sustainability Metrics",
        content: "These cards show your key metrics: companies managed, products analyzed, and collaboration requests. Right now you have 1 company (yours!) and 0 products - let's fix that!",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "ready-for-first-product",
        target: "body",
        title: "Time for Your First Product! 📦",
        content: "Now for the exciting part - let's add your first product and calculate its carbon footprint. This is where CarbonInsight really shines!",
        placement: "center",
        onComplete: {
          type: "navigate",
          payload: "/product-list/product",
          delay: 1500,
        },
      },
    ],
    nextFlow: "product-creation-wizard",
    completionMessage: "Dashboard tour complete! Let's create your first product...",
  },
  
  {
    id: "product-creation-wizard",
    name: "Product Creation Wizard",
    description: "Complete walkthrough of product creation process",
    trigger: "manual",
    priority: 7,
    startUrl: "/product-list/product",
    steps: [
      {
        id: "product-wizard-welcome",
        target: "body",
        title: "Product Carbon Footprint Wizard ⚡",
        content: "This is where the magic happens! We'll walk through calculating your product's complete carbon footprint across its entire lifecycle. Don't worry - we'll guide you through each step!",
        placement: "center",
        delay: 1000,
      },
      {
        id: "tab-system-overview",
        target: "[role='tablist']",
        title: "The Five-Step Process",
        content: "See these tabs? We'll go through each one: Product Info → Bill of Materials → Production Energy → User Energy → Transportation. Each step builds your complete carbon profile.",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "start-with-basics",
        target: "[name='product_name']",
        title: "Start with the Basics",
        content: "First, give your product a name and SKU. These will appear in your Digital Product Passport, so make them clear and professional.",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "save-and-continue-concept",
        target: "body",
        title: "Save As You Go 💾",
        content: "Important tip: Save each tab before moving to the next! This preserves your data and unlocks the calculation process. Take your time - we're building something comprehensive here.",
        placement: "center",
      },
      {
        id: "complete-your-product",
        target: "body",
        title: "Complete Your Product Setup",
        content: "Go ahead and fill out the product information, then work through the other tabs. When you're done, come back to the product list to see the magic - we'll show you the advanced features next!",
        placement: "center",
        onComplete: {
          type: "set-data",
          payload: { waitingForProductCompletion: true },
        },
      },
    ],
    nextFlow: "product-management-features",
    completionMessage: "Create your product, then we'll show you the advanced features!",
  },
  
  {
    id: "product-management-features",
    name: "Product Management Mastery",
    description: "Advanced product features and AI insights",
    trigger: "manual",
    priority: 6,
    startUrl: "/product-list",
    prerequisites: ["product-creation-wizard"],
    steps: [
      {
        id: "product-list-mastery-intro",
        target: "body",
        title: "Product Management Mastery 🚀",
        content: "Excellent! Now you have products in your portfolio. Let's explore the powerful features that make CarbonInsight special - AI insights, export options, and collaboration tools.",
        placement: "center",
        delay: 1000,
      },
      {
        id: "search-and-filter",
        target: "[placeholder*='Search']",
        title: "Smart Search & Organization",
        content: "Quickly find products by name, SKU, or manufacturer. As your product catalog grows, this becomes invaluable for organization.",
        placement: "bottom",
        waitForElement: true,
      },
      {
        id: "emissions-data-insight",
        target: "tbody tr:first-child td:nth-child(4)",
        title: "Carbon Footprint Insights",
        content: "Each product shows its total PCF (Product Carbon Footprint) in kg CO₂e. Click any product row to see detailed emission breakdowns by lifecycle stage.",
        placement: "left",
        waitForElement: true,
      },
      {
        id: "ai-optimization-power",
        target: "button:has(.text-purple-500)",
        title: "AI-Powered Optimization ✨",
        content: "This is game-changing! Our AI analyzes your product data and suggests specific, actionable ways to reduce carbon footprint. Try it!",
        placement: "top",
        waitForElement: true,
      },
      {
        id: "export-digital-passports",
        target: "button:has([class*='FileDown'])",
        title: "Digital Product Passports",
        content: "Export your data in industry-standard formats: AAS for technical integration, SCSN for supply chains, or PDF for reports. All formats meet regulatory requirements!",
        placement: "top",
        waitForElement: true,
      },
      {
        id: "collaboration-preview",
        target: "body",
        title: "Supply Chain Collaboration 🤝",
        content: "Soon we'll show you how to collaborate with suppliers and customers, sharing verified emission data for complete supply chain transparency. But first, let's explore one more area...",
        placement: "center",
        onComplete: {
          type: "navigate",
          payload: "/dashboard",
          delay: 1500,
        },
      },
    ],
    nextFlow: "advanced-features",
    completionMessage: "You're becoming a CarbonInsight expert! One more area to explore...",
  },
  
  {
    id: "advanced-features",
    name: "Advanced Features & Collaboration",
    description: "Data sharing, audit logs, and expert features",
    trigger: "manual",
    priority: 5,
    startUrl: "/dashboard",
    steps: [
      {
        id: "advanced-user-welcome",
        target: "body",
        title: "Advanced Features 🎯",
        content: "You're now a CarbonInsight power user! Let's explore the advanced features that set you apart: audit logs, collaboration tools, and compliance features.",
        placement: "center",
        delay: 1000,
      },
      {
        id: "audit-compliance",
        target: "[aria-label*='table']",
        title: "Audit Trail & Compliance",
        content: "This audit log tracks every change to your data - who, what, when. Essential for regulatory compliance and certifications. Shows you take sustainability seriously!",
        placement: "top",
        waitForElement: true,
      },
      {
        id: "collaboration-teaser",
        target: "a[href='/product-data-sharing']",
        title: "Collaboration Hub",
        content: "This area manages data sharing requests from customers and suppliers. When they request your emission data, you approve or deny here - maintaining control while enabling transparency.",
        placement: "top",
      },
      {
        id: "keyboard-shortcuts-hint",
        target: "body",
        title: "Pro Tips: Keyboard Shortcuts ⌨️",
        content: "Power users love efficiency! Press '/' to search anywhere, 'N' to create new items, '?' for help, and 'Esc' to close dialogs. We've built this for speed!",
        placement: "center",
      },
      {
        id: "onboarding-complete",
        target: "body",
        title: "Congratulations! You're Ready! 🎓",
        content: "You've mastered CarbonInsight! You can now: create companies, calculate product carbon footprints, get AI optimization suggestions, export Digital Product Passports, and collaborate with your supply chain. Welcome to the future of sustainable manufacturing!",
        placement: "center",
        showSkip: false,
      },
    ],
    completionMessage: "Onboarding complete! You're now a CarbonInsight expert!",
  },
  
  // Feature-specific flows for later discovery
  {
    id: "ai-assistant-deep-dive",
    name: "AI Assistant Mastery",
    description: "Deep dive into AI optimization features",
    trigger: "feature-discovery",
    priority: 4,
    steps: [
      {
        id: "ai-privacy-first",
        target: "body",
        title: "AI Privacy & Security 🔒",
        content: "Your data privacy is paramount. Our AI analyzes your product information to provide recommendations without storing sensitive business data permanently.",
        placement: "center",
      },
      {
        id: "ai-recommendation-types",
        target: "body",
        title: "Types of AI Recommendations",
        content: "The AI suggests: alternative materials with lower impact, energy efficiency improvements, supplier optimizations, transportation improvements, and end-of-life strategies.",
        placement: "center",
      },
    ],
  },
  
  {
    id: "keyboard-mastery",
    name: "Keyboard Shortcuts Mastery",
    description: "Work at lightning speed",
    trigger: "manual",
    priority: 3,
    steps: [
      {
        id: "efficiency-intro",
        target: "body",
        title: "Work at Lightning Speed ⚡",
        content: "These shortcuts will make you incredibly efficient. Master these and you'll fly through CarbonInsight!",
        placement: "center",
      },
      {
        id: "universal-shortcuts",
        target: "body",
        title: "Universal Shortcuts",
        content: "• Press '/' to search anywhere\n• Press 'N' to create new items\n• Press '?' for help\n• Press 'Esc' to close anything\n\nTry them now!",
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
  const [currentFlow, setCurrentFlow] = useState<TourFlow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedFlows, setCompletedFlows] = useState<Set<string>>(new Set());
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Load progress from localStorage with proper user scoping
  useEffect(() => {
    if (typeof window !== "undefined" && user?.id) {
      const savedFlows = localStorage.getItem(`completed_flows_${user.id}`);
      const savedOnboardingStep = localStorage.getItem(`onboarding_step_${user.id}`);
      
      if (savedFlows) {
        setCompletedFlows(new Set(JSON.parse(savedFlows)));
      }
      
      if (savedOnboardingStep) {
        setOnboardingStep(parseInt(savedOnboardingStep, 10));
      }
    }
  }, [user]);

  // Save progress to localStorage
  const saveProgress = useCallback((flows: Set<string>, step: number) => {
    if (typeof window !== "undefined" && user?.id) {
      localStorage.setItem(`completed_flows_${user.id}`, JSON.stringify([...flows]));
      localStorage.setItem(`onboarding_step_${user.id}`, step.toString());
    }
  }, [user]);

  // Smart auto-trigger logic - only for truly new users
  useEffect(() => {
    if (!isAuthenticated || isActive || !user) return;

    // Only auto-trigger for completely new users
    if (completedFlows.size === 0 && onboardingStep === 0) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        startFlow("complete-onboarding", false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, completedFlows.size, onboardingStep, isActive]);

  const startFlow = useCallback((flowId: string, force: boolean = false) => {
    const flow = TOUR_FLOWS.find(f => f.id === flowId);
    if (!flow || (isActive && !force)) return;

    // Check prerequisites
    if (flow.prerequisites && !force) {
      const missing = flow.prerequisites.filter(req => !completedFlows.has(req));
      if (missing.length > 0) {
        console.log(`Flow ${flowId} requires: ${missing.join(', ')}`);
        return;
      }
    }

    // Navigate to start URL if specified and we're not already there
    if (flow.startUrl && pathname !== flow.startUrl) {
      router.push(flow.startUrl);
      // Wait for navigation, then start tour
      setTimeout(() => {
        setCurrentFlow(flow);
        setCurrentStepIndex(0);
        setIsActive(true);
      }, 1000);
    } else {
      setCurrentFlow(flow);
      setCurrentStepIndex(0);
      setIsActive(true);
    }

    // Announce to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = `Starting ${flow.name}`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, [isActive, router, pathname, completedFlows]);

  const stopFlow = useCallback(() => {
    setIsActive(false);
    setCurrentFlow(null);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    if (!currentFlow) return;

    const currentStep = currentFlow.steps[currentStepIndex];
    const isLastStep = currentStepIndex === currentFlow.steps.length - 1;
    
    // Handle step completion actions
    if (currentStep.onComplete) {
      const { onComplete } = currentStep;
      
      if (onComplete.type === "navigate" && onComplete.payload) {
        setTimeout(() => {
          router.push(onComplete.payload);
        }, onComplete.delay || 500);
      } else if (onComplete.type === "wait") {
        // Just wait, don't advance step yet
        setTimeout(() => {
          if (!isLastStep) {
            setCurrentStepIndex(prev => prev + 1);
          }
        }, onComplete.delay || 1000);
        return;
      }
    }

    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Flow completed
      const newCompleted = new Set(completedFlows);
      newCompleted.add(currentFlow.id);
      setCompletedFlows(newCompleted);
      
      // Update onboarding progress
      const newOnboardingStep = Math.max(onboardingStep, getFlowOnboardingStep(currentFlow.id));
      setOnboardingStep(newOnboardingStep);
      
      saveProgress(newCompleted, newOnboardingStep);
      
      stopFlow();
      
      // Handle flow completion
      handleFlowCompletion(currentFlow);

      // Announce completion
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = `${currentFlow.name} completed`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  }, [currentFlow, currentStepIndex, completedFlows, onboardingStep, saveProgress, stopFlow, router]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const skipFlow = useCallback(() => {
    if (!currentFlow) return;

    const newCompleted = new Set(completedFlows);
    newCompleted.add(currentFlow.id);
    setCompletedFlows(newCompleted);
    
    const newOnboardingStep = Math.max(onboardingStep, getFlowOnboardingStep(currentFlow.id));
    setOnboardingStep(newOnboardingStep);
    
    saveProgress(newCompleted, newOnboardingStep);
    stopFlow();
  }, [currentFlow, completedFlows, onboardingStep, saveProgress, stopFlow]);

  // Handle post-flow actions and automatic continuation
  const handleFlowCompletion = useCallback((completedFlow: TourFlow) => {
    if (completedFlow.completionAction) {
      const { completionAction } = completedFlow;
      
      if (completionAction.type === "navigate") {
        setTimeout(() => {
          router.push(completionAction.payload);
        }, 1000);
      } else if (completionAction.type === "trigger-flow" && completedFlow.nextFlow) {
        setTimeout(() => {
          startFlow(completedFlow.nextFlow!);
        }, 1500);
      }
    } else if (completedFlow.nextFlow) {
      // Auto-continue to next flow
      setTimeout(() => {
        startFlow(completedFlow.nextFlow!);
      }, 1500);
    }
  }, [router, startFlow]);

  // Helper function to map flow IDs to onboarding steps
  const getFlowOnboardingStep = (flowId: string): number => {
    const stepMap: Record<string, number> = {
      "complete-onboarding": 1,
      "company-creation-guided": 2,
      "dashboard-and-first-product": 3,
      "product-creation-wizard": 4,
      "product-management-features": 5,
      "advanced-features": 6,
    };
    return stepMap[flowId] || 0;
  };

  // Special trigger functions
  const triggerOnboardingFlow = useCallback(() => {
    startFlow("complete-onboarding", true);
  }, [startFlow]);

  const triggerFeatureDiscovery = useCallback((featureId: string) => {
    const flow = TOUR_FLOWS.find(f => f.trigger === "feature-discovery" && f.id.includes(featureId));
    if (flow) {
      startFlow(flow.id);
    }
  }, [startFlow]);

  const value: TourContextType = {
    isActive,
    currentFlow,
    currentStepIndex,
    startFlow,
    stopFlow,
    nextStep,
    prevStep,
    skipFlow,
    completedFlows,
    availableFlows: TOUR_FLOWS,
    currentOnboardingStep: onboardingStep,
    isOnboardingComplete: onboardingStep >= 6,
    triggerOnboardingFlow,
    triggerFeatureDiscovery,
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

// Helper hook for triggering specific events
export function useTourTrigger() {
  const { startFlow, triggerOnboardingFlow, triggerFeatureDiscovery } = useTour();

  return {
    triggerOnboardingFlow,
    triggerFeatureDiscovery,
    triggerKeyboardShortcuts: () => startFlow("keyboard-mastery"),
    triggerAIDeepDive: () => startFlow("ai-assistant-deep-dive"),
    triggerManualFlow: (flowId: string) => startFlow(flowId, true),
  };
}
