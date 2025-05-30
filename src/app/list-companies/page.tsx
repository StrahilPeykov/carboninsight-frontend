"use client";

import { useEffect, useState } from "react";
import { Building2, LogIn, Users, Boxes, Share2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";
import { companyApi, Company } from "@/lib/api/companyApi";
import { setLocalStorageItem } from "@/lib/api/apiClient";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

export default function ListCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isLoading: authLoading, requireAuth } = useAuth();

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
    setLocalStorageItem("selected_company_id", companyId);
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
            carbon footprints and generating Digital Product Passports.
          </p>
          <Link href="/create-company">
            <Button size="lg" className="flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" />
              Create Your First Company
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Your Companies
              </h1>
              <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                Select a company to manage products and carbon footprint data
              </p>
            </div>
            <Link href="/create-company">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Company
              </Button>
            </Link>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(company => (
              <Card
                key={company.id}
                className="relative overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Company Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2 truncate">{company.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                        VAT: {company.vat_number}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        Reg: {company.business_registration_number}
                      </p>
                    </div>
                  </div>

                  {/* Main action button */}
                  <Button
                    onClick={() => selectCompany(company.id)}
                    className="w-full flex items-center justify-center gap-2 mb-3"
                  >
                    <LogIn className="w-4 h-4" />
                    Select Company
                  </Button>

                  {/* Quick actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLocalStorageItem("selected_company_id", company.id);
                        router.push("/manage-user");
                      }}
                      className="flex items-center justify-center gap-1"
                      title="Manage users"
                    >
                      <Users className="w-3 h-3" />
                      <span className="hidden lg:inline">Users</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLocalStorageItem("selected_company_id", company.id);
                        router.push("/product-list");
                      }}
                      className="flex items-center justify-center gap-1"
                      title="View products"
                    >
                      <Boxes className="w-3 h-3" />
                      <span className="hidden lg:inline">Products</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLocalStorageItem("selected_company_id", company.id);
                        router.push("/product-data-sharing");
                      }}
                      className="flex items-center justify-center gap-1"
                      title="Data sharing"
                    >
                      <Share2 className="w-3 h-3" />
                      <span className="hidden lg:inline">Sharing</span>
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
