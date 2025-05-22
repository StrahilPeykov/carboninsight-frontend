"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Info, FileDown, Download } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ExportModal from "../components/ui/ExportModal";

// Product type
type Product = {
  id: string;
  supplier: string;
  emission_total: string; //pcf_value
  name: string;
  description: string;
  manufacturer_name: string;
  sku: string;
  is_public: true;
  status: "Imported" | "Estimated" | "Pending" | string; //not yet implemented
  pcf_calculation_method: string; //not yet implemented


//   "id": 0,
// "supplier": 0,
// "emission_total": 0.1,
// "name": "string",
// "description": "string",
// "manufacturer_name": "string",
// "manufacturer_country": "AF",
// "manufacturer_city": "string",
// "manufacturer_street": "string",
// "manufacturer_zip_code": "string",
// "year_of_construction": 1900,
// "family": "string",
// "sku": "string",
// "reference_impact_unit": "A1",
// "is_public": true
};

export default function ProductListPage() {
  const router = useRouter();
  const { isLoading, requireAuth } = useAuth();

  // Require authentication for this page
  requireAuth();

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLoading, setDataLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [editMode, setEditMode] = useState(false);
  const [exportingIds, setExportingIds] = useState<Set<string>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProductForExport, setSelectedProductForExport] = useState<Product | null>(null);

  // Get status color for display
  const getStatusColor = (status: string) => {
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

  // Check authentication and get company ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("selected_company_id");
      if (!id) {
        router.push("/list-companies");
      } else {
        setCompanyId(id);
      }
      setInitializing(false);
    }
  }, [router]);

  const fetchProducts = async (query = "") => {
    if (!companyId) return;
    try {
      setDataLoading(true);
      setError("");
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }
      const searchParam = query.length >= 4 ? `?search=${encodeURIComponent(query)}` : "";
      const url = `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/products${searchParam}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const transformed: Product[] = data.map((p: Product) => ({
        id: p.id,
        supplier: p.supplier,
        manufacturer_name: p.manufacturer_name ?? "Unknown",
        name: p.name,
        sku: p.sku,
        description: p.description,
        status: p.status,
        pcf_calculation_method: p.pcf_calculation_method,
        emission_total: p.emission_total,
        is_public: p.is_public,
      }));
      setProducts(transformed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchProducts();
  }, [companyId]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!companyId) return;
      if (searchQuery.length === 0 || searchQuery.length >= 4) {
        fetchProducts(searchQuery);
        setCurrentPage(1);
      } else {
        setProducts([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleExportClick = (product: Product) => {
    setSelectedProductForExport(product);
    setShowExportModal(true);
  };

  const handleExportModalClose = () => {
    setShowExportModal(false);
    setSelectedProductForExport(null);
  };

  const paginatedProducts = products.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600"></div>
        <span className="ml-4 text-gray-600">Loading company information...</span>
      </div>
    );
  }

  const handleProductClick = (sku: string) => {
    if (editMode) {
      router.push(`/product-list/add-product?sku=${sku}`);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Products</h1>

        {dataLoading && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500 mr-2"></div>
            Loading product data...
          </div>
        )}

        <div className="flex justify-between items-center">
          <div></div>
          <div className="flex gap-2">
            <Button
              onClick={() => setEditMode(prev => !prev)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${editMode ? "bg-gray-500 text-white" : "bg-gray-200 text-black"}`}
            >
              {editMode ? "Cancel" : "Edit"}
            </Button>
            <Link href="/product-list/add-product">
              <Button className="bg-black text-white rounded-full px-4 py-2 text-xl">+</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by product, SKU or manufacturer name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

      <Card className="p-4">
        {dataLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"></div>
            <span className="ml-3 text-gray-500">Loading products...</span>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="min-w-full table-auto text-xl">
            <thead>
              <tr className="text-left border-b">
                <th className="py-3 px-6 font-medium text-left">Company</th>
                <th className="py-3 px-6 font-medium text-left">Product name</th>
                <th className="py-3 px-6 font-medium text-left">SKU</th>
                <th className="py-3 px-6 font-medium text-left">Status</th>
                <th className="py-3 px-6 font-medium text-left">PCF calculation method</th>
                <th className="py-3 px-6 font-medium text-left">PCF</th>
                <th className="py-3 px-6 font-medium text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xl">
              {paginatedProducts.map((product, idx) => (
                <tr
                  key={idx}
                  className={`border-b hover:bg-gray-50 cursor-${editMode ? "pointer" : "default"} ${editMode ? "opacity-50 hover:opacity-100" : ""}`}
                  onClick={() => handleProductClick(product.sku)}
                >
                  <td className="p-2">{product.manufacturer_name}</td>
                  <td className="p-2">{product.name}</td>
                  <td className="p-2">{product.sku}</td>
                  <td className="p-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(product.status)}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="p-2">{product.pcf_calculation_method}</td>
                  <td className="p-2 flex items-center gap-1">
                    {product.emission_total}
                    <Info className="w-4 h-4 text-gray-400" />
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportClick(product);
                        }}
                        className="flex items-center gap-1 text-xs"
                      >
                        <FileDown className="w-3 h-3" />
                        <span>Export</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && !dataLoading && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-4">
                    {searchQuery.length < 4 && searchQuery.length > 0
                      ? "Please enter at least 4 characters to search."
                      : "No products found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {!dataLoading && products.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Button
                className="px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                {currentPage} / {Math.ceil(products.length / rowsPerPage)}
              </span>
              <Button
                className="px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * rowsPerPage >= products.length}
              >
                Next
              </Button>
            </div>
            <div>
              <label className="text-sm">Rows per page:</label>{" "}
              <select
                className="border rounded px-2 py-1 text-sm ml-2"
                value={rowsPerPage}
                onChange={e => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Export Modal */}
      {showExportModal && selectedProductForExport && companyId && (
        <ExportModal
          isOpen={showExportModal}
          onClose={handleExportModalClose}
          product={selectedProductForExport}
          companyId={companyId}
        />
      )}
    </div>
  );
}
