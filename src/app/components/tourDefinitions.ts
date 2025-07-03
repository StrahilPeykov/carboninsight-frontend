// Tour system type definitions and configuration
// Defines the structure for interactive guided tours across the application
// Supports both static informational steps and interactive action-based steps

// Base interface containing common properties for all tour step types
// Provides foundation for both static and interactive tour step variants
interface BaseTourStep {
  // Route pattern where this step should appear ("*" for any page)
  page: string; 
  // CSS selector for the element to highlight during this step
  target: string; 
  // Main heading displayed in the tour tooltip
  title: string; 
  // Detailed explanation or instruction text for the user
  content: string; 
  // Tooltip positioning relative to target element
  placement: "top" | "bottom" | "left" | "right" | "center"; 
  // Additional padding around highlighted element for visual emphasis
  spotlightPadding?: number; 
  // Whether users can skip this specific step (defaults to true)
  allowSkip?: boolean; 
  // Whether clicking outside tour area dismisses the tour (defaults to true)
  allowClickOutside?: boolean; 
}

// Interactive tour step that requires user action before progressing
// Used for guided workflows where user must complete specific actions
// Ensures critical onboarding steps are completed before moving forward
interface InteractiveTourStep extends BaseTourStep {
  // Pauses tour progression until expectedAction is completed
  waitForAction: true;
  // Specific action identifier that the tour system waits for
  expectedAction: string; 
}

// Static informational tour step that displays content without requiring action
// Used for explanatory content where user can navigate freely
// Allows users to read and understand features at their own pace
interface StaticTourStep extends BaseTourStep {
  // Optional flag indicating no action required (default behavior)
  waitForAction?: false; 
  // TypeScript ensures expectedAction cannot be set for static steps
  expectedAction?: never; 
}

// Union type providing comprehensive type safety for tour step definitions
// Discriminated union based on waitForAction property ensures proper typing
// Prevents invalid combinations of interactive and static step properties
export type TourStep = InteractiveTourStep | StaticTourStep;

// Tour definitions organized by unique identifier strings
// Each tour consists of ordered steps that guide users through specific workflows and features
// Tours can span multiple pages using route patterns and support both linear and conditional progression
// The system handles cross-page navigation, state persistence, and user interaction tracking
// Key features: interactive steps with action requirements, flexible positioning, accessibility support
export const TOURS: Record<string, TourStep[]> = {
  "main-onboarding": [
    // Initial onboarding tour - always available for new users
    {
      page: "*",
      target: ".company-selector-button",
      title: "Welcome to CarbonInsight!",
      content:
        "Let's get you started by creating your first company. This will allow you to add products and calculate their carbon footprints. Click on the company selector to begin.",
      placement: "bottom",
      waitForAction: true,
      expectedAction: "click-company-selector",
      allowSkip: true,
      allowClickOutside: false,
    },
    // Company creation step - guides user to create their first company
    {
      page: "*",
      target: '[data-tour-target="create-company"]',
      title: "Create Your First Company",
      content:
        'Perfect! Now click on "Create" to set up your company profile. This is the foundation for all your carbon footprint calculations.',
      placement: "left",
      waitForAction: true,
      expectedAction: "navigate-to-create-company",
      allowSkip: true,
      allowClickOutside: false,
    },
    // Company creation form - guides user through filling out company details
    {
      page: "/create-company",
      target: 'input[name="name"]',
      title: "Business Name",
      content:
        "Enter your company's legal business name. This will be used throughout the platform and in all generated reports and Carbon Footprint Reports.",
      placement: "right",
      spotlightPadding: 20,
      allowSkip: true,
      allowClickOutside: false,
    },
    // Company creation form - guides user through entering company details
    {
      page: "/create-company",
      target: 'input[name="vat_number"]',
      title: "VAT Number",
      content:
        "Enter your company's VAT (Value Added Tax) number. This helps us verify your business identity and is required for compliance reporting.",
      placement: "right",
      spotlightPadding: 20,
      allowSkip: true,
      allowClickOutside: false,
    },
    // Company creation form - guides user through entering company details
    {
      page: "/create-company",
      target: 'input[name="business_registration_number"]',
      title: "Business Registration Number",
      content:
        "Enter your official business registration number (Chamber of Commerce number, Company House number, etc.). This is used for legal identification and compliance.",
      placement: "right",
      spotlightPadding: 20,
      allowSkip: true,
      allowClickOutside: false,
    },
    // Company creation form - guides user through entering company details
    {
      page: "/create-company",
      target: 'button[type="submit"]',
      title: "Complete Setup!",
      content:
        "Once you've filled in all the details, click Submit to create your company. You'll then be taken to the dashboard where you can start adding products and calculating their carbon footprint.",
      placement: "top",
      spotlightPadding: 20,
      allowSkip: true,
      allowClickOutside: false,
    },
  ],
  "product-list-tour": [
    // Product management tour - guides user through product management features
    {
      page: "*",
      target: '[data-tour-target="products-nav"]',
      title: "Product Management Tour",
      content:
        'Let\'s explore how to manage your products and calculate their carbon footprints. Click on the "Products" navigation button to get started.',
      placement: "bottom",
      waitForAction: true,
      expectedAction: "navigate-to-products",
      allowClickOutside: false,
      allowSkip: true,
    },
    // Product list page - introduces the product management interface
    {
      page: "/product-list",
      target: ".mb-6, .max-w-7xl",
      title: "Add Your First Product",
      content:
        "When you're ready to add products, you'll use the \"Add Product\" button here. For now, let's continue exploring the product management features.",
      placement: "center",
      allowClickOutside: false,
      allowSkip: true,
    },
    // Product creation step - guides user to add their first product
    {
      page: "/product-list",
      target: 'input[placeholder*="Search"], input[placeholder*="search"]',
      title: "Search Products",
      content:
        "Quickly find products by searching for their name, SKU, or manufacturer. The search works across all your product data.",
      placement: "bottom",
      spotlightPadding: 8,
      allowClickOutside: false,
      allowSkip: true,
    },
    // Product list page - explains the product table and its features
    {
      page: "/product-list",
      target: ".max-w-7xl",
      title: "Product Actions & Features",
      content:
        "Once you have products, you'll see action buttons for each product: Export (download Carbon Footprint Reports), AI advice (carbon reduction recommendations), Edit, and Delete. The table shows key information like manufacturer, name, SKU, and carbon footprint.",
      placement: "center",
      allowClickOutside: false,
      allowSkip: true,
    },
    // Product management completion - final step of the tour
    {
      page: "/product-list",
      target: ".max-w-7xl",
      title: "Product Management Complete",
      content:
        "You've completed the product management tour! You can now add products, search through them, and export Carbon Footprint Reports. Use the Help menu to restart tours anytime.",
      placement: "center",
      allowClickOutside: false,
      allowSkip: true,
    },
  ],
  "company-tour": [
    // Company management tour - guides user through managing multiple companies
    {
      page: "*",
      target: '[data-tour-target="dashboard-nav"]',
      title: "Company Management Tour",
      content:
        "Let's explore how to manage multiple companies. First, go to your dashboard where you can access company management features.",
      placement: "bottom",
      waitForAction: true,
      expectedAction: "navigate-to-dashboard",
      allowClickOutside: false,
      allowSkip: true,
    },
    // Dashboard navigation - directs user to the company management hub
    {
      page: "/dashboard",
      target: '[data-tour-target="companies-link"]',
      title: "View All Companies",
      content:
        'From the dashboard, click on "Your Companies" to access the company management hub where you can view all your companies.',
      placement: "right",
      waitForAction: true,
      expectedAction: "navigate-to-companies",
      allowClickOutside: false,
      allowSkip: true,
    },
    // Company management hub - introduces the company management interface
    {
      page: "/list-companies",
      target: "h1",
      title: "Company Management Hub",
      content:
        "This is your company management hub. Here you can create new companies, switch between them, and manage company settings and users.",
      placement: "bottom",
      allowClickOutside: false,
      allowSkip: true,
    },
    // Company creation step - guides user to create additional companies
    {
      page: "/list-companies",
      target: '[href="/create-company"]',
      title: "Create Additional Companies",
      content:
        "You can create multiple companies if you manage different businesses, subsidiaries, or want to separate different product lines.",
      placement: "bottom",
      allowClickOutside: false,
      allowSkip: true,
    },
    // Company cards and quick actions - explains the company overview
    {
      page: "/list-companies",
      target: ".grid > div:first-child",
      title: "Company Cards & Quick Actions",
      content:
        'Each company is displayed as a card. Click "Select Company" to work with that company, or use the quick action buttons to manage users, view products, or handle data sharing requests.',
      placement: "right",
      allowClickOutside: false,
      allowSkip: true,
    },
  ],
};
