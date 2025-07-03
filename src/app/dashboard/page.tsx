// Client-side component directive for Next.js App Router
"use client";

// React hooks for state management and lifecycle
import { useEffect, useState } from "react";
// Next.js navigation component
import Link from "next/link";
// Custom UI components
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
// Authentication context for user management
import { useAuth } from "../context/AuthContext";
// Lucide React icons for visual elements
import { Building2, BoxesIcon, Share2, Network, Factory, GaugeCircle, Info } from "lucide-react";
// Loading skeleton component for better UX during data fetching
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
// Next.js router for programmatic navigation
import { useRouter } from "next/navigation";
// Audit log component for displaying company activity
import AuditLog from "../components/ui/AuditLog";
// API functions for product and audit log operations
import { productApi } from "@/lib/api/productApi";
import { auditLogApi, LogItem } from "@/lib/api/auditLogApi";
// Tooltip components for providing additional information
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Interface defining the structure of company data received from the API
// This matches the backend Company model and ensures type safety for company-related operations
interface CompanyData {
  id: string; // Unique identifier for the company in the database
  name: string; // Company's official business name
  vat_number: string; // Value Added Tax registration number for EU compliance
  business_registration_number: string; // Official business registration number with local authorities
  total_emissions_across_products: number; // Calculated total CO2 emissions from all products (kg CO₂-eq)
  products_using_count: number; // Count of external products that include this company's products in their BOM
  companies_using_count: number; // Count of distinct companies that use this company's products
}

// Main dashboard page component that displays company overview and statistics
// This is the primary landing page after login, providing a comprehensive overview
// of the user's companies, products, and environmental impact metrics
export default function DashboardPage() {
  // Authentication and routing hooks from custom context and Next.js
  const { user, isLoading, requireAuth } = useAuth();
  const router = useRouter();

  // Enforce authentication requirement for this protected route
  // This will redirect unauthenticated users to the login page automatically
  requireAuth();

  // State variables for dashboard metrics and data
  // These track various counts and data needed for the dashboard display
  const [companyCount, setCompanyCount] = useState(0); // Total number of user's companies
  const [productCount, setProductCount] = useState(0); // Total products for selected company
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0); // Pending product sharing requests awaiting approval
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null); // Currently selected company details from localStorage
  const [logItems, setLogItems] = useState<LogItem[]>([]); // Audit log entries for the company (for compliance tracking)
  const [error, setError] = useState<string | null>(null); // Error state for API failures (displayed to user)
  const [dataLoading, setDataLoading] = useState(true); // Loading state for dashboard data (shows skeleton while fetching)
  const [mounted, setMounted] = useState(false); // Client-side mounting state to prevent hydration issues with localStorage
  
  // Company statistics for external usage and impact metrics
  // These metrics show how the company's products are being used by other companies
  // and the environmental impact across the entire supply chain
  const [companyStats, setCompanyStats] = useState({
    total_emissions_across_products: 0, // Total CO2 emissions from all uses of company products (direct + indirect)
    products_using_count: 0, // Number of external products that include this company's products
    companies_using_count: 0, // Number of external companies using this company's products
  });

  // API base URL configuration with fallback for local development
  // Uses environment variable for production, falls back to localhost for development
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // Client-side mounting effect to prevent hydration mismatches
  // This ensures localStorage access only happens on the client side
  // Without this, SSR would fail because localStorage is not available on the server
  useEffect(() => {
    setMounted(true);
  }, []);

  // Navigation guard: redirect to company selection if no company is selected
  // This effect runs after authentication is resolved and component is mounted
  // It ensures users always have a company context before viewing the dashboard
  useEffect(() => {
    if (!isLoading && mounted && typeof window !== "undefined" && !localStorage.getItem("selected_company_id")) {
      router.push("/list-companies");
    }
  }, [isLoading, router, mounted]);

  // Navigation handler with tour system integration
  // Dispatches tour events when navigation occurs during an active tour
  // This allows the guided tour system to track user progress and trigger next steps
  const handleTourNavigation = (path: string, tourAction?: string) => {
    const activeTour = sessionStorage.getItem("activeTour");
    if (activeTour && tourAction) {
      // Dispatch custom event for tour system to handle navigation tracking
      window.dispatchEvent(new CustomEvent("tourAction", { detail: { action: tourAction } }));
    }
    router.push(path);
  };

  // Centralized unauthorized access handler
  // Clears authentication data and redirects to login on 401 errors
  // This ensures consistent behavior across all API calls in this component
  const handleUnauthorized = (status: number) => {
    if (status === 401) {
      // Clear all authentication-related data from localStorage to force re-login
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("selected_company_id"); // Also clear company selection
      }
      // Redirect to login page for re-authentication
      router.push("/login");
      return true; // Indicate that unauthorized handling was performed
    }
    return false; // Indicate that this was not a 401 error
  };

  // Main data fetching effect for dashboard content
  // Loads companies, products, sharing requests, audit logs, and company statistics
  // This is the core data loading logic that populates all dashboard metrics
  useEffect(() => {
    // Early return if component hasn't mounted yet (prevents SSR issues)
    if (!mounted) return;

    // Async function to fetch all dashboard data in sequence
    // We define this inside the effect to have access to all state setters
    const fetchDashboardData = async () => {
      try {
        setDataLoading(true); // Show loading state to user
        
        // Retrieve authentication token from localStorage
        // This token is required for all authenticated API calls
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

        // Early return with error if no authentication token is found
        if (!token) {
          setError("No authentication token found");
          setDataLoading(false);
          return;
        }

        // Step 1: Fetch all companies associated with the authenticated user
        // This provides the count for the "Your Companies" card
        const companiesResponse = await fetch(`${API_URL}/companies/my/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // JWT token for authentication
          },
        });

        // Handle unauthorized access (token expired or invalid)
        if (handleUnauthorized(companiesResponse.status)) return;

        if (!companiesResponse.ok) {
          throw new Error(`Error fetching companies: ${companiesResponse.status}`);
        }

        const companiesData = await companiesResponse.json();
        setCompanyCount(companiesData.length); // Update companies count for dashboard card

        // Step 2: Get the currently selected company from localStorage
        // The selected company determines which company's data to display
        const selectedCompanyId =
          typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;

        // Only proceed with company-specific data if a company is selected
        if (selectedCompanyId) {
          // Step 3: Fetch detailed information for the selected company
          // This includes company stats like emissions and usage metrics
          const companyResponse = await fetch(`${API_URL}/companies/${selectedCompanyId}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (handleUnauthorized(companyResponse.status)) return;

          if (!companyResponse.ok) {
            throw new Error(`Error fetching company details: ${companyResponse.status}`);
          }

          const companyData = await companyResponse.json();
          setSelectedCompany(companyData); // Store company details for header display

          // Step 4: Fetch all products belonging to the selected company
          // This provides the count for the "Products" card
          const productsResponse = await fetch(
            `${API_URL}/companies/${selectedCompanyId}/products/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (handleUnauthorized(productsResponse.status)) return;

          if (!productsResponse.ok) {
            throw new Error(`Error fetching products: ${productsResponse.status}`);
          }

          const productsData = await productsResponse.json();
          setProductCount(productsData.length); // Update products count for dashboard card

          // Step 5: Fetch product sharing requests and filter for pending ones
          // This is wrapped in try-catch to handle potential API errors gracefully
          // Some companies may not have sharing functionality enabled
          try {
            const sharingRequests = await productApi.getProductSharingRequests(selectedCompanyId);
            // Filter for pending requests and count them for the dashboard card
            setPendingRequestsCount(sharingRequests.filter(request => request.status === "Pending").length);
          } catch (err) {
            // Handle 401 errors specifically for sharing requests
            // Type checking is verbose but necessary for TypeScript safety
            if (typeof err === 'object' && err !== null && 'response' in err && typeof err.response === 'object' && err.response !== null && 'status' in err.response && err.response.status === 401) {
              handleUnauthorized(401);
              return;
            }
            console.error("Error fetching sharing requests:", err);
            setPendingRequestsCount(0); // Default to 0 if sharing requests fail
          }

          // Step 6: Load audit log entries for the selected company
          // This provides a history of actions performed within the company
          // Used for compliance, transparency, and debugging purposes
          try {
            const auditLogItems = await auditLogApi.getCompanyAuditLogs(parseInt(selectedCompanyId));
            setLogItems(auditLogItems); // Store audit log for display at bottom of page
          } catch (err) {
            console.error("Error fetching audit logs:", err);
            // Continue execution even if audit logs fail (not critical for dashboard functionality)
          }

          // Step 7: Set company statistics for impact metrics display
          // These stats show how the company's products are being used by others
          // They provide insights into business reach and environmental impact
          setCompanyStats({
            total_emissions_across_products: companyData.total_emissions_across_products || 0, // Total environmental impact
            products_using_count: companyData.products_using_count || 0, // Product integration reach
            companies_using_count: companyData.companies_using_count || 0, // Business network reach
          });
        }

        setError(null); // Clear any previous errors on successful data fetch
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        // Set user-friendly error message based on error type
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setDataLoading(false); // Always hide loading state when done (success or failure)
      }
    };

    // Only fetch data when authentication is resolved and component is mounted
    // This prevents unnecessary API calls during the loading state
    if (!isLoading && mounted) {
      fetchDashboardData();
    }
  }, [API_URL, isLoading, mounted]); // Re-run effect if API URL, loading state, or mount state changes

  // Show loading skeleton while authentication or data is being fetched
  if (isLoading || dataLoading || !mounted) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  // Display error state if data fetching failed
  if (error) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // Main dashboard content rendering
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome header section with personalized greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Welcome,{" "}
          {/* Display user's full name if available, otherwise fallback to first name or username */}
          {user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : user?.first_name || user?.username}
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          {/* Show current company context or prompt to select one */}
          {selectedCompany ? `Managing ${selectedCompany.name}` : "Select a company to manage your products and carbon footprint data"}
        </p>
      </div>

      {/* Quick Stats - Primary metrics overview with navigation functionality */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Companies card - clickable with tour integration */}
        <button
          onClick={() => handleTourNavigation("/list-companies", "navigate-to-companies")}
          className="block transition-transform hover:scale-105 w-full text-left"
          data-tour-target="companies-link"
        >
          <Card className="bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 cursor-pointer hover:shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-800">
                <Building2 className="h-6 w-6 text-red dark:text-red-200" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Your Companies
                </h3>
                <p className="text-2xl font-semibold">{companyCount}</p>
              </div>
            </div>
          </Card>
        </button>

        {/* Products card - navigates to product list */}
        <button
          onClick={() => handleTourNavigation("/product-list", "navigate-to-products")}
          className="block transition-transform hover:scale-105 w-full text-left"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 cursor-pointer hover:shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-800">
                <BoxesIcon className="h-6 w-6 text-blue-600 dark:text-blue-200" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Products</h3>
                <p className="text-2xl font-semibold">{productCount}</p>
              </div>
            </div>
          </Card>
        </button>

        {/* Pending requests card - links to product data sharing page */}
        <Link href="/product-data-sharing" className="block transition-transform hover:scale-105">
          <Card className="bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 cursor-pointer hover:shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-800">
                <Share2 className="h-6 w-6 text-green-600 dark:text-green-200" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Pending Requests
                </h3>
                <p className="text-2xl font-semibold">{pendingRequestsCount}</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Impact Metrics - Secondary stats showing company's environmental and business impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <TooltipProvider delayDuration={0}>
          {/* Companies using your products - shows business reach */}
          <Card className="bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-800">
                <Factory className="h-6 w-6 text-purple-600 dark:text-purple-200" />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  Companies using your products
                  {/* Tooltip providing detailed explanation of the metric */}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-help touch-none" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                      <p className="w-[200px] text-sm">
                        Number of disctinct companies whose products' BOMs include at least one
                        product supplied by this company.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </h3>
                <p className="text-2xl font-semibold">{companyStats.companies_using_count}</p>
              </div>
            </div>
          </Card>

          {/* Products using your products - shows supply chain integration */}
          <Card className="bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-800">
                <Network className="h-6 w-6 text-orange-600 dark:text-orange-200" />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  Products using your products
                  {/* Tooltip explaining product integration metric */}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-help touch-none" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                      <p className="w-[200px] text-sm">
                        Number of distinct products, from any company except this one, that include
                        a product supplied by this company in their BOM.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </h3>
                <p className="text-2xl font-semibold">{companyStats.products_using_count}</p>
              </div>
            </div>
          </Card>

          {/* Environmental impact - total emissions across all product usage */}
          <Card className="bg-gradient-to-r from-teal-50 to-white dark:from-teal-900/20 dark:to-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-800">
                <GaugeCircle className="h-6 w-6 text-teal-600 dark:text-teal-200" />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  Your impact on the planet
                  {/* Tooltip explaining environmental impact calculation */}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-help touch-none" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                      <p className="w-[200px] text-sm">
                        For each product this company supplies, the total number of times it's used
                        in any depth of any BoM, direct or indirect, then multiplying by that
                        product's emissions and summing it all up.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </h3>
                <p className="text-2xl font-semibold">
                  {/* Display emissions rounded to nearest kg with CO2 equivalent unit */}
                  {companyStats.total_emissions_across_products.toFixed(0)} kg CO₂-eq
                </p>
              </div>
            </div>
          </Card>
        </TooltipProvider>
      </div>

      {/* Main Actions - Primary action cards for company and product management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Company management section */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Manage Companies</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create and manage companies, add authorized users, and handle data sharing requests.
          </p>
          <div className="space-y-3">
            {/* View existing companies button */}
            <button
              onClick={() => handleTourNavigation("/list-companies", "navigate-to-companies")}
              className="block w-full"
            >
              <Button className="w-full flex justify-between items-center">
                <span>View Companies</span>
                <Building2 className="ml-2 h-4 w-4" />
              </Button>
            </button>
            {/* Create new company button */}
            <button
              onClick={() => handleTourNavigation("/create-company", undefined)}
              className="block w-full"
            >
              <Button variant="outline" className="w-full">
                Create New Company
              </Button>
            </button>
          </div>
        </Card>

        {/* Product management section */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add products and calculate their carbon footprint using our step-by-step process to
            generate Carbon Footprint Reports.
          </p>
          <div className="space-y-3">
            {/* View existing products button */}
            <button
              onClick={() => handleTourNavigation("/product-list", "navigate-to-products")}
              className="block w-full"
            >
              <Button className="w-full flex justify-between items-center">
                <span>View Products</span>
                <BoxesIcon className="ml-2 h-4 w-4" />
              </Button>
            </button>
            {/* Add new product button */}
            <button
              onClick={() => handleTourNavigation("/product-list/product", undefined)}
              className="block w-full"
            >
              <Button variant="outline" className="w-full">
                Add New Product
              </Button>
            </button>
          </div>
        </Card>
      </div>

      {/* Audit Log - Company activity history for transparency and compliance */}
      <AuditLog caption="A table displaying the auditlog of a company." logItems={logItems} />
    </div>
  );
}
