"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Info } from "lucide-react";
import { productApi, Product } from "@/lib/api/productApi";

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);

  const rowsPerPage = 15;
  const router = useRouter();

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
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    }

    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
      return;
    }
    setCompanyId(id);
  }, [router]);

  // Fetch products when company ID is available
  useEffect(() => {
    if (!companyId) return;

    async function fetchProducts() {
      try {
        setLoading(true);
        // Using productApi instead of direct fetch - with type safety
        if (companyId) {
          // Explicit null check for TypeScript
          const data = await productApi.listProducts(companyId);
          setProducts(data);
          setFilteredProducts(data);
          setError("");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [companyId]);

  // Filter products based on search query
  useEffect(() => {
    const filtered = products.filter(
      product =>
        product.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, products]);

  // Calculate pagination
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleAddProduct = () => {
    router.push("/product-list/add-product");
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button
          onClick={handleAddProduct}
          className="bg-green-600 hover:bg-green-700 rounded-full px-4 py-2 text-xl"
        >
          +
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by company or product name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

      <Card className="p-4">
        {loading ? (
          <p>Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-gray-500 mb-4">No products found.</p>
            <Button onClick={handleAddProduct}>Add Your First Product</Button>
          </div>
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
              </tr>
            </thead>
            <tbody className="text-xl">
              {paginatedProducts.map((product, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-500 transition-colors duration-200">
                  <td className="p-2">{product.company_name}</td>
                  <td className="p-2">{product.product_name}</td>
                  <td className="p-2">{product.sku}</td>
                  <td className="p-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(product.status)}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="p-2">{product.pcf_calculation_method}</td>
                  <td className="py-3 px-6 whitespace-nowrap text-left">
                    {product.pcf_value}
                    <Info className="w-4 h-4 text-gray-400 ml-1 inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredProducts.length > rowsPerPage && (
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
                Page {currentPage} of {Math.ceil(filteredProducts.length / rowsPerPage)}
              </span>
              <Button
                className="px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                onClick={() =>
                  setCurrentPage(p =>
                    Math.min(Math.ceil(filteredProducts.length / rowsPerPage), p + 1)
                  )
                }
                disabled={currentPage * rowsPerPage >= filteredProducts.length}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
