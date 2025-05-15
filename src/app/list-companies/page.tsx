"use client";

import { useEffect, useState } from "react";
import { Building2, LogIn, Users, BarChart, Edit, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Link from "next/link";

type Company = {
  id: string;
  name: string;
  vat_number: string;
  business_registration_number: string;
};

export default function ListCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // API URL from environment variables with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/companies/my/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch companies");

        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, [API_URL, router]);

  const selectCompany = (companyId: string) => {
    localStorage.setItem("selected_company_id", companyId);
    router.push("/dashboard");
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Your Companies</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Select a company to manage or create a new one
          </p>
        </div>
        <Link href="/create-company">
          <Button className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Create New Company
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">No companies found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You don't have any companies yet. Create one to get started with calculating your product carbon footprint.
          </p>
          <Link href="/create-company">
            <Button size="lg">Create Your First Company</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <Card key={company.id} className="relative overflow-hidden">
              {/* Company Info */}
              <div className="p-6">
                <div className="flex items-start justify-between">
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

                {/* Action buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => selectCompany(company.id)}
                    className="flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Select
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      localStorage.setItem("selected_company_id", company.id);
                      router.push("/company-details");
                    }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
                
                {/* Additional action buttons */}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      localStorage.setItem("selected_company_id", company.id);
                      router.push("/manage-user");
                    }}
                    className="flex items-center justify-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    <span className="hidden sm:inline">Users</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      localStorage.setItem("selected_company_id", company.id);
                      router.push("/product-list");
                    }}
                    className="flex items-center justify-center gap-1"
                  >
                    <BarChart className="w-3 h-3" />
                    <span className="hidden sm:inline">Products</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      localStorage.setItem("selected_company_id", company.id);
                      router.push("/manage-sharing");
                    }}
                    className="flex items-center justify-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Sharing</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
