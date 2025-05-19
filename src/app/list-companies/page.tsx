"use client";

import { useEffect, useState } from "react";
import { Building2, LogIn, Users, BarChart, Edit, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
<<<<<<< HEAD
import Link from "next/link";

type Company = {
  id: string;
  name: string;
  vat_number: string;
  business_registration_number: string;
};
=======
import { companyApi, Company } from "@/lib/api/companyApi";
>>>>>>> main

export default function ListCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [error, setError] = useState("");
=======
  const [error, setError] = useState<string | null>(null);
>>>>>>> main
  const router = useRouter();

  useEffect(() => {
    async function fetchCompanies() {
      try {
<<<<<<< HEAD
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
=======
        setLoading(true);
        // Using companyApi instead of direct fetch
        const data = await companyApi.listCompanies();
        setCompanies(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch companies");
>>>>>>> main
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  const handleSelectCompany = (companyId: string) => {
    localStorage.setItem("selected_company_id", companyId);
    router.push(`/get-started`);
  };

  const selectCompany = (companyId: string) => {
    localStorage.setItem("selected_company_id", companyId);
    router.push("/dashboard");
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Your Companies
          </h1>
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

<<<<<<< HEAD
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
            You do not have any companies yet. Create one to get started with calculating your
            product carbon footprint.
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
=======
      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

      <div className="mb-6 flex justify-between items-center">
        <div></div>
        <Button
          onClick={() => router.push("/create-company")}
          className="bg-green-600 hover:bg-green-700"
        >
          Create New Company
        </Button>
      </div>

      <Card className="p-4">
        {loading ? (
          <p className="text-base">Loading...</p>
        ) : companies.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-gray-500 mb-4">You do not have any companies yet.</p>
            <Button
              onClick={() => router.push("/create-company")}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Your First Company
            </Button>
          </div>
        ) : (
          <table className="min-w-full table-auto text-xl">
            <thead>
              <tr className="py-3 px-6 font-medium text-left">
                <th className="p-2">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Company
                  </div>
                </th>
                <th className="p-2 hidden md:table-cell">VAT Number</th>
                <th className="p-2 hidden md:table-cell">Registration Number</th>
                <th className="p-2 w-24 sm:w-32 text-right">
                  <span className="inline-flex items-center justify-end w-full px-3 py-1 text-xl">
                    <LogIn className="w-4 h-4 mr-1" />
                    Action
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="text-xl">
              {companies.map(company => (
                <tr
                  key={company.id}
                  className="border-b hover:bg-gray-500 transition-colors duration-200"
                >
                  <td className="p-2">{company.name}</td>
                  <td className="p-2 hidden md:table-cell">{company.vat_number}</td>
                  <td className="p-2 hidden md:table-cell">
                    {company.business_registration_number}
                  </td>
                  <td className="py-3 px-6 whitespace-nowrap text-left">
                    <div className="flex justify-end w-full">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleSelectCompany(company.id)}
                      >
                        <LogIn className="w-4 h-4" />
                        Enter
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
>>>>>>> main
    </div>
  );
}
