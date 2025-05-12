"use client";

import { useEffect, useState } from "react";
import { Building2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

type Company = {
  id: string;
  name: string;
  vat_number: string;
  business_registration_number: string;
};

export default function ListCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
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

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, [API_URL, router]);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white sm:text-4xl">
          List of companies
        </h1>
      </div>

      <Card className="p-4">
        {loading ? (
          <p className="text-sm">Loading...</p>
        ) : (
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Company
                  </div>
                </th>
                <th className="p-2 w-24 sm:w-32 text-right">
                  <span className="inline-flex items-center justify-end w-full px-3 py-1 text-sm">
                    <LogIn className="w-4 h-4 mr-1" />
                    Action
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.id} className="border-b hover:bg-gray-400">
                  <td className="p-2">{company.name}</td>
                  <td className="p-2 w-24 sm:w-32">
                    <div className="flex justify-end w-full">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => {
                          localStorage.setItem("selected_company_id", company.id);
                          router.push(`/get-started`);
                        }}
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
