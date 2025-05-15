"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { Building2, BoxesIcon, BarChartIcon, FileTextIcon } from "lucide-react";

interface CompanyData {
  id: string;
  name: string;
  vat_number: string;
  business_registration_number: string;
}

interface ActivityItem {
  date: string;
  action: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [companyCount, setCompanyCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [dppCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // API URL from environment variables with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Function to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch companies count
        const companiesResponse = await fetch(`${API_URL}/companies/my/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json();
          setCompanyCount(companiesData.length);

          // Get the selected company ID
          const selectedCompanyId = localStorage.getItem("selected_company_id");

          if (selectedCompanyId) {
            // Fetch selected company details
            const companyResponse = await fetch(`${API_URL}/companies/${selectedCompanyId}/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (companyResponse.ok) {
              const companyData = await companyResponse.json();
              setSelectedCompany(companyData);

              // Fetch products for the selected company
              const productsResponse = await fetch(
                `${API_URL}/companies/${selectedCompanyId}/products/`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                setProductCount(productsData.length);

                // Generate recent activity based on products
                const recentActivities: ActivityItem[] = [];

                // Add company creation activity
                recentActivities.push({
                  date: new Date().toISOString().split("T")[0],
                  action: `Selected company: ${companyData.name}`,
                });

                // Add recent product activities (up to 3 most recent products)
                const sortedProducts = [...productsData].sort((a, b) => b.id - a.id).slice(0, 3);
                sortedProducts.forEach(product => {
                  recentActivities.push({
                    date: new Date(Date.now() - Math.random() * 5 * 86400000)
                      .toISOString()
                      .split("T")[0],
                    action: `Added product: ${product.name}`,
                  });
                });

                setRecentActivity(recentActivities);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Welcome, {user?.first_name || user?.username}
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          {selectedCompany
            ? `Managing ${selectedCompany.name}`
            : "Select a company to manage your products and carbon footprint data"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-gradient-to-r from-red-50 to-white dark:from-red-900/20 dark:to-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-800">
              <Building2 className="h-6 w-6 text-red dark:text-red-200" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Companies</h3>
              <p className="text-2xl font-semibold">{companyCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
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

        <Card className="bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-800">
              <FileTextIcon className="h-6 w-6 text-green-600 dark:text-green-200" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generated DPPs</h3>
              <p className="text-2xl font-semibold">{dppCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Manage Companies</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create and manage companies, add authorized users, and handle data sharing requests.
          </p>
          <div className="space-y-3">
            <Link href="/list-companies" className="block">
              <Button className="w-full flex justify-between items-center">
                <span>View Companies</span>
                <Building2 className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/create-company" className="block">
              <Button variant="outline" className="w-full">
                Create New Company
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Calculate Product Carbon Footprint</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start the step-by-step process to calculate your product carbon footprint and generate a
            Digital Product Passport.
          </p>
          <div className="space-y-3">
            <Link href="/get-started" className="block">
              <Button className="w-full flex justify-between items-center">
                <span>Start PCF Calculation</span>
                <BarChartIcon className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/product-list" className="block">
              <Button variant="outline" className="w-full">
                Manage Products
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivity.map((activity, index) => (
              <li key={index} className="py-3">
                <div className="flex space-x-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        )}
      </Card>
    </div>
  );
}
