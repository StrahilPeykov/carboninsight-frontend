"use client";

import { useEffect, useState } from "react";
import { Building2, LogIn, Users, Boxes, Share2, Plus, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";
import { companyApi, Company } from "@/lib/api/companyApi";
import { setLocalStorageItem } from "@/lib/api/apiClient";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import { useTour } from "../components/TourProvider";

export default function ListCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isLoading: authLoading, requireAuth } = useAuth();
  const { startTour, resetTour } = useTour();

  // Require authentication for this page
  requireAuth();

  // Ensure component is mounted before fetching
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        // Using companyApi instead of direct fetch
        const data = await companyApi.listCompanies();
        setCompanies(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && mounted) {
      fetchCompanies();
    }
  }, [authLoading, mounted]);

  const selectCompany = (companyId: string) => {
    console.log("List companies: selecting company", companyId);
    
    // Check if already selected to prevent unnecessary work
    const currentCompanyId = localStorage.getItem("selected_company_id");
    if (currentCompanyId === companyId) {
      console.log("Company already selected, just navigating to dashboard");
      router.push("/dashboard");
      return;
    }

    setLocalStorageItem("selected_company_id", companyId);

    // Dispatch events to notify other components
    if (typeof window !== "undefined") {
      console.log("List companies: dispatching events for company selection");
      window.dispatchEvent(new CustomEvent("companyListChanged"));
      window.dispatchEvent(new CustomEvent("companyChanged"));
    }

    // Navigate to dashboard
    console.log("List companies: navigating to dashboard");
    router.push("/dashboard");
  };

  if (authLoading || loading || !mounted) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {companies.length === 0 ? (
        // Empty state - no companies yet
        <div className="text-center py-12">
          <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Welcome to CarbonInsight
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            You don't have any companies yet. Create your first company to start calculating product
            carbon footprints and generating Carbon Footprint Reports.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/create-company">
              <Button size="lg" className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Your First Company
              </Button>
            </Link>
            
            {/* Tour button for empty state */}
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => {
                // Reset and start the main onboarding tour
                resetTour("main-onboarding");
                startTour("main-onboarding");
              }}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Take a Tour
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl truncate">
                Your Companies
              </h1>
              <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                Select a company to manage products and carbon footprint data
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/create-company">
                <Button className="flex items-center gap-2 w-full sm:w-auto">
                  <Plus className="w-4 h-4" />
                  <span className="whitespace-nowrap">Add Company</span>
                </Button>
              </Link>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {companies.map(company => (
              <Card
                key={company.id}
                className="relative overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Company Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h2 className="text-xl font-bold mb-2 truncate min-w-0" title={company.name}>
                        {company.name}
                      </h2>
                      <div className="space-y-1">
                        <p
                          className="text-sm text-gray-500 dark:text-gray-400 break-all"
                          title={`VAT: ${company.vat_number}`}
                        >
                          <span className="font-medium">VAT:</span> {company.vat_number}
                        </p>
                        <p
                          className="text-sm text-gray-500 dark:text-gray-400 break-all"
                          title={`Reg: ${company.business_registration_number}`}
                        >
                          <span className="font-medium">Reg:</span>{" "}
                          {company.business_registration_number}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main action button */}
                  <Button
                    onClick={() => selectCompany(company.id)}
                    className="w-full flex items-center justify-center gap-2 mb-3"
                  >
                    <LogIn className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Select Company</span>
                  </Button>

                  {/* Quick actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLocalStorageItem("selected_company_id", company.id);
                        // Notify navbar
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new CustomEvent("companyChanged"));
                        }
                        router.push("/manage-user");
                      }}
                      className="flex items-center justify-center gap-1 min-w-0"
                      title="Manage users"
                    >
                      <Users className="w-3 h-3 flex-shrink-0" />
                      <span className="hidden lg:inline truncate">Users</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLocalStorageItem("selected_company_id", company.id);
                        // Notify navbar
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new CustomEvent("companyChanged"));
                        }
                        router.push("/product-list");
                      }}
                      className="flex items-center justify-center gap-1 min-w-0"
                      title="View products"
                    >
                      <Boxes className="w-3 h-3 flex-shrink-0" />
                      <span className="hidden lg:inline truncate">Products</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLocalStorageItem("selected_company_id", company.id);
                        // Notify navbar
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new CustomEvent("companyChanged"));
                        }
                        router.push("/product-data-sharing");
                      }}
                      className="flex items-center justify-center gap-1 min-w-0"
                      title="Data sharing"
                    >
                      <Share2 className="w-3 h-3 flex-shrink-0" />
                      <span className="hidden lg:inline truncate">Sharing</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
