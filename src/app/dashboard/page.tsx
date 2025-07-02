"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { Building2, BoxesIcon, Share2, Network, Factory, GaugeCircle, Info } from "lucide-react";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { useRouter } from "next/navigation";
import AuditLog from "../components/ui/AuditLog";
import { productApi } from "@/lib/api/productApi";
import { auditLogApi, LogItem } from "@/lib/api/auditLogApi";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Company data interface for dashboard statistics and information display
 */
interface CompanyData {
  id: string;
  name: string;
  vat_number: string;
  business_registration_number: string;
  total_emissions_across_products: number;
  products_using_count: number;
  companies_using_count: number;
}

/**
 * Dashboard Page Component
 * 
 * The main dashboard provides users with an overview of their CarbonInsight activities,
 * including company statistics, quick actions, and recent activity logs.
 * 
 * Key Features:
 * - Company selection and statistics display
 * - Product and company counts with quick navigation
 * - Pending data sharing requests overview
 * - Environmental impact metrics and tooltips
 * - Integrated guided tour support
 * - Real-time audit log display
 * - Responsive card-based layout
 * - Authentication requirement enforcement
 */
export default function DashboardPage() {
  const { user, isLoading, requireAuth } = useAuth();
  const router = useRouter();

  // Require authentication for this page - redirect to login if not authenticated
  requireAuth();

  // Dashboard statistics state management
  const [companyCount, setCompanyCount] = useState(0);                    // Total companies user has access to
  const [productCount, setProductCount] = useState(0);                   // Products in selected company
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);   // Pending data sharing requests
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null); // Currently selected company
  const [logItems, setLogItems] = useState<LogItem[]>([]);               // Audit log entries
  const [error, setError] = useState<string | null>(null);               // Error state for API failures
  const [dataLoading, setDataLoading] = useState(true);                  // Loading state for data fetching
  const [mounted, setMounted] = useState(false);                         // Client-side mounting state

  // Company statistics for environmental impact display
  const [companyStats, setCompanyStats] = useState<{
    total_emissions_across_products: number;
    products_using_count: number;
    companies_using_count: number;
  }>({
    total_emissions_across_products: 0,
    products_using_count: 0,
    companies_using_count: 0,
  });

  // API URL configuration with fallback for development
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  /**
   * Ensure component is mounted before accessing localStorage
   * Prevents hydration mismatches between server and client
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Check if a company is selected and redirect if none found
   * This ensures users have selected a company before viewing the dashboard
   */
  useEffect(() => {
    if (
      !isLoading &&
      mounted &&
      typeof window !== "undefined" &&
      !localStorage.getItem("selected_company_id")
    ) {
      router.push("/list-companies");
    }
  }, [isLoading, router, mounted]);

  /**
   * Handle navigation with guided tour support
   * Dispatches tour events when active tour is detected in session storage
   */
  const handleTourNavigation = (path: string, tourAction?: string) => {
    const activeTour = sessionStorage.getItem("activeTour");
    if (activeTour && tourAction) {
      window.dispatchEvent(
        new CustomEvent("tourAction", {
          detail: { action: tourAction },
        })
      );
    }
    router.push(path);
  };

  /**
   * Handle unauthorized API responses
   * Clears authentication data and redirects to login when receiving 401 errors
   */
  const handleUnauthorized = (status: number) => {
    if (status === 401) {
      // Clear authentication data on unauthorized access
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("selected_company_id");
      }
      // Redirect to login page for re-authentication
      router.push("/login");
      return true;
    }
    return false;
  };

  /**
   * Main dashboard data fetching effect
   * Loads companies, products, sharing requests, and audit logs
   */
  useEffect(() => {
    if (!mounted) return;

    const fetchDashboardData = async () => {
      try {
        setDataLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

        if (!token) {
          setError("No authentication token found");
          setDataLoading(false);
          return;
        }

        // Fetch user's companies for count display
        const companiesResponse = await fetch(`${API_URL}/companies/my/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (handleUnauthorized(companiesResponse.status)) return;

        if (!companiesResponse.ok) {
          throw new Error(`Error fetching companies: ${companiesResponse.status}`);
        }

        const companiesData = await companiesResponse.json();
        setCompanyCount(companiesData.length);

        // Get the selected company ID from localStorage
        const selectedCompanyId =
          typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;

        if (selectedCompanyId) {
          // Fetch detailed information for the selected company
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
          setSelectedCompany(companyData);

          // Fetch products for the selected company to get product count
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
          setProductCount(productsData.length);

          // Fetch product sharing requests and count pending ones
          try {
            const sharingRequests = await productApi.getProductSharingRequests(selectedCompanyId);
            const pendingCount = sharingRequests.filter(
              request => request.status === "Pending"
            ).length;
            setPendingRequestsCount(pendingCount);
          } catch (err) {
            // Handle sharing request errors gracefully
            if (
              typeof err === 'object' &&
              err !== null &&
              'response' in err &&
              typeof err.response === 'object' &&
              err.response !== null &&
              'status' in err.response &&
              err.response.status === 401
            ) {
              handleUnauthorized(401);
              return;
            }
            console.error("Error fetching sharing requests:", err);
            setPendingRequestsCount(0);
          }

          // Load audit log items for activity tracking
          try {
            const auditLogItems = await auditLogApi.getCompanyAuditLogs(
              parseInt(selectedCompanyId)
            );
            setLogItems(auditLogItems);
          } catch (err) {
            console.error("Error fetching audit logs:", err);
          }

          // Update company statistics for environmental impact display
          setCompanyStats({
            total_emissions_across_products: companyData.total_emissions_across_products || 0,
            products_using_count: companyData.products_using_count || 0,
            companies_using_count: companyData.companies_using_count || 0,
          });
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setDataLoading(false);
      }
    };

    // Only fetch data when authentication is complete and component is mounted
    if (!isLoading && mounted) {
      fetchDashboardData();
    }
  }, [API_URL, isLoading, mounted]);

  // Show loading skeleton while authentication or data loading is in progress
  if (isLoading || dataLoading || !mounted) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  // Show error state if data fetching failed
  if (error) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome header with user name and company information */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Welcome,{" "}
          {user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : user?.first_name || user?.username}
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          {selectedCompany
            ? `Managing ${selectedCompany.name}`
            : "Select a company to manage your products and carbon footprint data"}
        </p>
      </div>

      {/* Quick Statistics Grid - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Companies Card - Navigation to company list with tour support */}
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

        {/* Products Card - Navigation to product list */}
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

        {/* Pending Requests Card - Data sharing management */}
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

      {/* Environmental Impact Statistics Grid - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <TooltipProvider delayDuration={0}>
          {/* Companies Using Your Products - Supply chain impact metric */}
          <Card className="bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-800">
                <Factory className="h-6 w-6 text-purple-600 dark:text-purple-200" />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  Companies using your products
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

          {/* Products Using Your Products - Product network reach */}
          <Card className="bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-800">
                <Network className="h-6 w-6 text-orange-600 dark:text-orange-200" />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  Products using your products
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

          {/* Total Environmental Impact - Cumulative emissions calculation */}
          <Card className="bg-gradient-to-r from-teal-50 to-white dark:from-teal-900/20 dark:to-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-800">
                <GaugeCircle className="h-6 w-6 text-teal-600 dark:text-teal-200" />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  Your impact on the planet
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-help touch-none" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                      <p className="w-[200px] text-sm">
                        For each product this company supplies, the total numner of times it's used
                        in any depth of any BoM, direct or indirect, then multiplying by that
                        product's emissions and summing it all up.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </h3>
                <p className="text-2xl font-semibold">
                  {companyStats.total_emissions_across_products.toFixed(0)} kg CO₂-eq
                </p>
              </div>
            </div>
          </Card>
        </TooltipProvider>
      </div>

      {/* Main Action Cards - Primary workflow entry points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Company Management Card */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Manage Companies</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create and manage companies, add authorized users, and handle data sharing requests.
          </p>
          <div className="space-y-3">
            {/* View Companies button with tour support */}
            <button
              onClick={() => handleTourNavigation("/list-companies", "navigate-to-companies")}
              className="block w-full"
            >
              <Button className="w-full flex justify-between items-center">
                <span>View Companies</span>
                <Building2 className="ml-2 h-4 w-4" />
              </Button>
            </button>
            {/* Create New Company button */}
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

        {/* Product Management Card */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add products and calculate their carbon footprint using our step-by-step process to
            generate Carbon Footprint Reports.
          </p>
          <div className="space-y-3">
            {/* View Products button with tour support */}
            <button
              onClick={() => handleTourNavigation("/product-list", "navigate-to-products")}
              className="block w-full"
            >
              <Button className="w-full flex justify-between items-center">
                <span>View Products</span>
                <BoxesIcon className="ml-2 h-4 w-4" />
              </Button>
            </button>
            {/* Add New Product button */}
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

      {/* Audit Log Section - Activity tracking and compliance */}
      <AuditLog caption="A table displaying the auditlog of a company." logItems={logItems} />
    </div>
  );
}
