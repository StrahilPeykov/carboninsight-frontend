"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Info, Plus, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

type Product = {
  id: string;
  name: string;
  sku: string;
  manufacturer: string;
  description?: string;
  is_public: boolean;
  co_2_emissions_override?: number;
  // Backend fields returned from API
  supplier: string;
  // Additional fields used in the rendering (may come from API or be derived)
  company_name?: string;
  status?: string;
  pcf_calculation_method?: string;
  pcf_value?: string;
};

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rowsPerPage] = useState(15);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");

  const router = useRouter();

  // Get the company ID from localStorage
  const companyId = localStorage.getItem("selected_company_id");

  // API URL from environment variables with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const getStatusColor = (product: Product) => {
    // Determine status based on product data
    const status = getProductStatus(product);

    switch (status) {
      case "Imported":
        return "bg-green-100 text-green-700";
      case "Estimated":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Helper function to determine product status
  const getProductStatus = (product: Product): string => {
    if (product.status) {
      return product.status;
    }

    if (product.co_2_emissions_override !== undefined && product.co_2_emissions_override > 0) {
      return "Estimated";
    }

    // We would need to check if this product has emissions data
    // For now, default to "Pending" if no override is set
    return "Pending";
  };

  // Get PCF calculation method
  const getPCFMethod = (product: Product): string => {
    if (product.pcf_calculation_method) {
      return product.pcf_calculation_method;
    }

    if (product.co_2_emissions_override !== undefined && product.co_2_emissions_override > 0) {
      return "Emission Factor";
    }
    return "Pending";
  };

  // Get PCF value as formatted string
  const getPCFValue = (product: Product): string => {
    if (product.pcf_value) {
      return product.pcf_value;
    }

    if (product.co_2_emissions_override !== undefined && product.co_2_emissions_override > 0) {
      return `${product.co_2_emissions_override} kg CO2e`;
    }
    return "Pending";
  };

  // Fetch company data to display the name
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/companies/${companyId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch company data: ${response.status}`);
        }

        const data = await response.json();
        setCompanyName(data.name);
      } catch (err) {
        console.error("Error fetching company data:", err);
      }
    };

    fetchCompanyData();
  }, [API_URL, companyId, router]);

  useEffect(() => {
    if (!companyId) {
      setError("No company selected. Please select a company first.");
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        setLoading(true);
        const response = await fetch(`${API_URL}/companies/${companyId}/products/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();

        // Add derived properties for display if they don't exist
        const processedData = data.map((product: Product) => ({
          ...product,
          status: product.status || getProductStatus(product),
          pcf_calculation_method: product.pcf_calculation_method || getPCFMethod(product),
          pcf_value: product.pcf_value || getPCFValue(product),
          company_name: product.company_name || companyName,
        }));

        setProducts(processedData);
        setFilteredProducts(processedData);
      } catch (err) {
        console.error("Error fetching products:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching products");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_URL, companyId, router, companyName]);

  // Search and filter products
  useEffect(() => {
    let filtered = [...products];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatusFilter) {
      filtered = filtered.filter(product => getProductStatus(product) === selectedStatusFilter);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, products, selectedStatusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const navigateToProductDetails = (productId: string) => {
    router.push(`/product-list/${productId}`);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500 mt-1">
            {companyName
              ? `Manage products for ${companyName}`
              : "Manage your product catalog and carbon footprint data"}
          </p>
        </div>
        <Link href="/product-list/add-product">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            <span>Add Product</span>
          </Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="p-2 pl-10 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="sm:ml-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={16} />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {/* Filter options */}
      {isFilterOpen && (
        <Card className="mb-6 p-4">
          <h3 className="font-medium mb-3">Filter by Status</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatusFilter(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedStatusFilter === null
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatusFilter("Imported")}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedStatusFilter === "Imported"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Imported
            </button>
            <button
              onClick={() => setSelectedStatusFilter("Estimated")}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedStatusFilter === "Estimated"
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-700"
              }`}
            >
              Estimated
            </button>
            <button
              onClick={() => setSelectedStatusFilter("Pending")}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedStatusFilter === "Pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              Pending
            </button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-4">
            <LoadingSkeleton count={5} />
          </div>
        ) : error ? (
          <ErrorBanner error={error} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 px-6 font-medium text-left">Company</th>
                  <th className="py-3 px-6 font-medium text-left">Product name</th>
                  <th className="py-3 px-6 font-medium text-left">SKU</th>
                  <th className="py-3 px-6 font-medium text-left">Status</th>
                  <th className="py-3 px-6 font-medium text-left">PCF calculation method</th>
                  <th className="py-3 px-6 font-medium text-left">PCF</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, idx) => (
                    <tr
                      key={product.id || idx}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigateToProductDetails(product.id)}
                    >
                      <td className="py-3 px-6">{product.company_name || companyName}</td>
                      <td className="py-3 px-6">{product.name}</td>
                      <td className="py-3 px-6">{product.sku}</td>
                      <td className="py-3 px-6">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(product)}`}
                        >
                          {product.status || getProductStatus(product)}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        {product.pcf_calculation_method || getPCFMethod(product)}
                      </td>
                      <td className="py-3 px-6 whitespace-nowrap flex items-center">
                        {product.pcf_value || getPCFValue(product)}
                        <Info className="w-4 h-4 text-gray-400 ml-1" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-4">
                      {searchQuery
                        ? "No products match your search criteria"
                        : "No products found. Add your first product by clicking the 'Add Product' button."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {paginatedProducts.length > 0 && totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{" "}
                      <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * rowsPerPage, filteredProducts.length)}
                      </span>{" "}
                      of <span className="font-medium">{filteredProducts.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <div className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
