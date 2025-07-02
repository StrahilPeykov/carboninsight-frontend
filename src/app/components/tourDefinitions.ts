// Define proper interfaces for tour steps
interface BaseTourStep {
  page: string;
  target: string;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
  spotlightPadding?: number;
  allowSkip?: boolean;
  allowClickOutside?: boolean;
}

interface InteractiveTourStep extends BaseTourStep {
  waitForAction: true;
  expectedAction: string;
}

interface StaticTourStep extends BaseTourStep {
  waitForAction?: false;
  expectedAction?: never;
}

export type TourStep = InteractiveTourStep | StaticTourStep;

// Define tour steps that can span multiple pages
export const TOURS: Record<string, TourStep[]> = {
  "main-onboarding": [
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
