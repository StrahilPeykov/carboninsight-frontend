"use client";

// We definitely need this for the register page implementation
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

type Product = {
  company_name: string;
  product_name: string;
  sku: string;
  status: "Imported" | "Estimated" | "Pending" | string;
  pcf_calculation_method: string;
  pcf_value: string;
};

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const rowsPerPage = 15;
  const companyPk = 2; // Replace with actual company_pk
  const router = useRouter();

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

  useEffect(() => {
    async function fetchProducts() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }
        const res = await fetch(
          `https://carboninsight.win.tue.nl/api/companies/${companyPk}/products/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();

        // might not b necessary: transforming api data to match local type if needed
        const transformed: Product[] = data.map((p: Product) => ({
          company_name: p.company_name ?? "Unknown",
          product_name: p.product_name,
          sku: p.sku,
          status: p.status,
          pcf_calculation_method: p.pcf_calculation_method,
          pcf_value: p.pcf_value,
        }));

        setProducts(transformed);
        setFilteredProducts(transformed);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [companyPk, router]);

  //search stuff
  useEffect(() => {
    const filtered = products.filter(product =>
      product.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, products]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button className="bg-black text-white rounded-full px-4 py-2 text-xl">+</Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by company name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card className="p-4">
        {loading ? (
          <p>Loading products...</p>
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
                    <Info className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-4">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/*!loading && filteredProducts.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Button
                className="px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                {currentPage} / {Math.ceil(filteredProducts.length / rowsPerPage)}
              </span>
              <Button
                className="px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage * rowsPerPage >= filteredProducts.length}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <label className="text-sm">Rows per page:</label>{" "}
              <select className="border rounded px-2 py-1 text-sm ml-2" value={rowsPerPage}>
                <option>15</option>
                <option>30</option>
                <option>50</option>
              </select>
            </div>
          </div>
        )*/}
      </Card>
    </div>
  );
}
