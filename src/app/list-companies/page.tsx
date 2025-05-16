"use client";

import { useEffect, useState } from "react";
import { Building2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { companyApi, Company } from "@/lib/api/companyApi";

export default function ListCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

    fetchCompanies();
  }, []);

  const handleSelectCompany = (companyId: string) => {
    localStorage.setItem("selected_company_id", companyId);
    router.push(`/get-started`);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white sm:text-4xl">
          List of companies
        </h1>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

      <div className="mb-6 flex justify-between items-center">
        <div></div>
        <Button 
          onClick={() => router.push('/create-company')}
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
            <p className="text-gray-500 mb-4">You don't have any companies yet.</p>
            <Button 
              onClick={() => router.push('/create-company')}
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
                  <td className="p-2 hidden md:table-cell">{company.business_registration_number}</td>
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
    </div>
  );
}
