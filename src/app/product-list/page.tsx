"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { Edit, Info, Trash, FileDown, Boxes } from "lucide-react";
=======
import { Edit, Info, Trash, FileDown } from "lucide-react";
>>>>>>> main
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import Modal from "../components/ui/PopupModal";
import ReactMarkdown from "react-markdown";
import ExportModal from "../components/ui/ExportModal";

// Types
type Product = {
  id: string;
  supplier: string;
  emission_total: string;
  name: string;
  description: string;
  manufacturer_name: string;
  sku: string;
  is_public: true;
  status: "Imported" | "Estimated" | "Pending" | string;
  pcf_calculation_method: string;
};

// - Component -
export default function ProductListPage() {
  const router = useRouter();
  const { isLoading, requireAuth } = useAuth();

  // Require authentication
  requireAuth();

  // State
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [dataLoading, setDataLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [mounted, setMounted] = useState(false);
=======
>>>>>>> main

  // UI modes
  const [editMode, setEditMode] = useState(false); // AI-selection toggle

  // Export
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProductForExport, setSelectedProductForExport] = useState<Product | null>(null);

  // AI advice flow
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [pendingProductName, setPendingProductName] = useState<string>("");
  const [aiModalStep, setAiModalStep] = useState<"confirm" | "loading" | "result" | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [userPromptInput, setUserPromptInput] = useState<string>("");

<<<<<<< HEAD
  // Deletion confirmation state
=======
  // ── Deletion confirmation state ──
>>>>>>> main
  const [toDeleteProduct, setToDeleteProduct] = useState<Product | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

<<<<<<< HEAD
  // Ensure component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

=======
>>>>>>> main
  // Helpers
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

  // Init
  useEffect(() => {
<<<<<<< HEAD
    if (typeof window === "undefined" || !mounted) return;
=======
    if (typeof window === "undefined") return;
>>>>>>> main

    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
    } else {
      setCompanyId(id);
    }
    setInitializing(false);
<<<<<<< HEAD
  }, [router, mounted]);
=======
  }, [router]);
>>>>>>> main

  // Data fetch
  const fetchProducts = async (query = "") => {
    if (!companyId) return;

    try {
      setDataLoading(true);
      setError("");

<<<<<<< HEAD
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
=======
      const token = localStorage.getItem("access_token");
>>>>>>> main
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
      setProducts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    if (companyId && mounted) fetchProducts();
  }, [companyId, mounted]);

  // Debounced search
  useEffect(() => {
    if (!mounted) return;

=======
    if (companyId) fetchProducts();
  }, [companyId]);

  // Debounced search
  useEffect(() => {
>>>>>>> main
    const t = setTimeout(() => {
      if (!companyId) return;

      if (searchQuery.length === 0 || searchQuery.length >= 4) {
        fetchProducts(searchQuery);
        setCurrentPage(1);
      } else {
        setProducts([]);
      }
    }, 300);

    return () => clearTimeout(t);
<<<<<<< HEAD
  }, [searchQuery, companyId, mounted]);

  // CRUD actions

  // Opens the "type-to-confirm" modal
=======
  }, [searchQuery]);

  // CRUD actions

  // Opens the “type-to-confirm” modal
>>>>>>> main
  const handleDelete = (id: string) => {
    const prod = products.find(p => p.id === id) ?? null;
    setToDeleteProduct(prod);
    setConfirmInput("");
  };

  // Actually calls DELETE once confirmed
  const confirmDelete = async () => {
    if (!toDeleteProduct) return;
    setIsDeleting(true);
    try {
<<<<<<< HEAD
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const company_pk =
        typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;
=======
      const token = localStorage.getItem("access_token");
      const company_pk = localStorage.getItem("selected_company_id");
>>>>>>> main
      if (!token || !company_pk) {
        router.push("/login");
        return;
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${company_pk}/products/${toDeleteProduct.id}/`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Failed to delete product");
      }
      setProducts(prev => prev.filter(p => p.id !== toDeleteProduct.id));
    } catch (e) {
      console.error("Error deleting product:", e);
    } finally {
      setIsDeleting(false);
      setToDeleteProduct(null);
      setConfirmInput("");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/product-list/product?product_id=${id}`);
  };

  // Export workflow
  const handleExportClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProductForExport(product);
    setShowExportModal(true);
  };
<<<<<<< HEAD

=======
>>>>>>> main
  const handleExportModalClose = () => {
    setShowExportModal(false);
    setSelectedProductForExport(null);
  };

  // AI advice workflow
  const handleRequestProductAdvice = async (productId: string, prompt: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
<<<<<<< HEAD
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const company =
      typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;

=======
    const token = localStorage.getItem("access_token");
    const company = localStorage.getItem("selected_company_id");
>>>>>>> main
    if (!API_URL || !token || !company) return;

    try {
      setAiModalStep("loading");
<<<<<<< HEAD

=======
>>>>>>> main
      const res = await fetch(`${API_URL}/companies/${company}/products/${productId}/ai/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          user_prompt: prompt,
        }),
      });
<<<<<<< HEAD

      const data = await res.json();
      const product = products.find(p => p.id === productId);

=======
      const data = await res.json();
      const product = products.find(p => p.id === productId);
>>>>>>> main
      setAiAdvice(data.response);
      setPendingProductName(product?.name ?? "this product");
      setAiModalStep("result");
    } catch (err) {
      console.error("Failed to request AI advice", err);
      setAiModalStep(null);
      setAiAdvice(null);
    }
  };

  // Row click (AI selection mode)
  const handleProductClick = (id: string) => {
    if (!editMode) return;
<<<<<<< HEAD

=======
>>>>>>> main
    const product = products.find(p => p.id === id);
    setPendingProductId(id);
    setPendingProductName(product?.name ?? "");
    setAiModalStep("confirm");
  };

  // Pagination & slicing
  const paginatedProducts = products.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Early UI states
<<<<<<< HEAD
  if (isLoading || !mounted) {
=======
  if (isLoading) {
>>>>>>> main
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

  // Render
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header  */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Products</h1>

        {dataLoading && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500 mr-2"></div>
            Loading product data...
          </div>
        )}

        <div className="flex justify-between items-center">
<<<<<<< HEAD
          <p className="text-gray-500 dark:text-gray-400">
            Manage your products and calculate their carbon footprint
          </p>
=======
          <div />
>>>>>>> main
          <div className="flex gap-2">
            {/* AI toggle */}
            <Button
              onClick={() => setEditMode(prev => !prev)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                editMode ? "bg-gray-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {editMode ? "Cancel" : "AI"}
            </Button>

            {/* Add-product shortcut */}
            <Button
              onClick={() => {
                router.push(`/product-list/product`);
              }}
              className="bg-black text-white rounded-full px-4 py-2 text-xl"
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
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

      {/* Table card */}
      <Card className="p-4">
        {dataLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"></div>
            <span className="ml-3 text-gray-500">Loading products...</span>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {/* Desktop and tablet table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full table-auto text-base">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Manufacturer</th>
                    <th className="p-2">Product name</th>
                    <th className="p-2">SKU</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">PCF calculation method</th>
                    <th className="p-2">PCF</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>

                <tbody className="text-base">
                  {paginatedProducts.map(product => (
                    <tr
                      key={product.id}
                      className={`border-b hover:bg-gray-50 cursor-${editMode ? "pointer" : "default"} ${
                        editMode ? "opacity-50 hover:opacity-100" : ""
                      }`}
                      onClick={() => handleProductClick(product.id)}
                    >
                      <td className="p-2">{product.manufacturer_name}</td>
                      <td className="p-2">{product.name}</td>
                      <td className="p-2">{product.sku}</td>
                      <td className="p-2">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                            product.status
                          )}`}
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
                          {/* Export */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-xs"
                            onClick={e => handleExportClick(product, e)}
                          >
                            <FileDown className="w-3 h-3" />
                            Export
                          </Button>

                          {/* Edit */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleEdit(product.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                            disabled={isDeleting}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Empty state */}
                  {paginatedProducts.length === 0 && !dataLoading && (
                    <tr>
<<<<<<< HEAD
                      <td colSpan={7} className="text-center py-8">
                        {searchQuery.length > 0 && searchQuery.length < 4 ? (
                          <div className="text-gray-500">
                            Please enter at least 4 characters to search.
                          </div>
                        ) : searchQuery.length >= 4 ? (
                          <div className="text-gray-500">
                            No products found matching "{searchQuery}".
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Boxes className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="text-gray-500">
                              <p className="text-lg font-medium">No products yet</p>
                              <p className="text-sm mt-1">
                                Start by adding your first product to calculate its carbon
                                footprint.
                              </p>
                            </div>
                            <Link href="/product-list/product">
                              <Button className="mt-4">Add Your First Product</Button>
                            </Link>
                          </div>
                        )}
=======
                      <td colSpan={7} className="text-center text-gray-500 py-4">
                        {searchQuery.length > 0 && searchQuery.length < 4
                          ? "Please enter at least 4 characters to search."
                          : "No products found."}
>>>>>>> main
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Phone only stacked list */}
            <div className="sm:hidden space-y-4">
              {paginatedProducts.map(product => (
                <div
                  key={product.id}
                  className="border rounded-md p-4 shadow-sm hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
<<<<<<< HEAD
                >
                  <div className="mb-2">
                    <span className="font-medium text-gray-900">{product.name}</span>
                    <span
                      className={`ml-2 text-xs font-medium px-2 py-1 rounded ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Manufacturer: {product.manufacturer_name}</p>
                    <p>SKU: {product.sku}</p>
                    <p>Method: {product.pcf_calculation_method}</p>
                    <p className="flex items-center gap-1">
                      PCF: {product.emission_total}
                      <Info className="w-3 h-3 text-gray-400" />
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs"
                      onClick={e => handleExportClick(product, e)}
                    >
                      <FileDown className="w-3 h-3" />
                      Export
                    </Button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(product.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      disabled={isDeleting}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Mobile empty-state */}
              {paginatedProducts.length === 0 && !dataLoading && (
                <div className="text-center py-8">
                  {searchQuery.length > 0 && searchQuery.length < 4 ? (
                    <p className="text-gray-500">Please enter at least 4 characters to search.</p>
                  ) : searchQuery.length >= 4 ? (
                    <p className="text-gray-500">No products found matching "{searchQuery}".</p>
                  ) : (
                    <div className="space-y-4">
                      <Boxes className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-gray-500">
                        <p className="text-lg font-medium">No products yet</p>
                        <p className="text-sm mt-1">
                          Start by adding your first product to calculate its carbon footprint.
                        </p>
                      </div>
                      <Link href="/product-list/product">
                        <Button className="mt-4">Add Your First Product</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {products.length > 0 && (
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
          </>
        )}
      </Card>

      {/* Export modal */}
      {showExportModal && selectedProductForExport && companyId && (
        <ExportModal
          isOpen={showExportModal}
          onClose={handleExportModalClose}
          product={selectedProductForExport}
          companyId={companyId}
        />
      )}

      {/* AI modal (confirm → loading → result) */}
      {aiModalStep && (
        <Modal
          title={
            aiModalStep === "confirm"
              ? "Send product data to AI?"
              : aiModalStep === "loading"
                ? "Generating AI Advice..."
                : `AI Advice for ${pendingProductName}`
          }
          onClose={() => {
            setAiModalStep(null);
            setAiAdvice(null);
            setPendingProductId(null);
            setUserPromptInput("");
          }}
        >
          {aiModalStep === "confirm" && (
            <>
              <p className="text-sm text-gray-800 whitespace-pre-line mb-2">
                You're about to request AI-generated recommendations for:{" "}
                <strong>{pendingProductName}</strong>
              </p>

              <textarea
                value={userPromptInput}
                onChange={e => setUserPromptInput(e.target.value)}
                placeholder="Ask a specific question about this product..."
                className="w-full border rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />

              <div className="flex justify-end gap-2">
                <Button
                  onClick={async () => {
                    if (pendingProductId !== null) {
                      await handleRequestProductAdvice(
                        pendingProductId,
                        userPromptInput ||
                          "Please analyze this product and suggest solutions to reduce carbon footprint. (in 150 words)"
                      );
                    }
                  }}
                >
                  Send to AI
                </Button>
              </div>
            </>
          )}

=======
                >
                  {/* Manufacturer, Product, SKU, Status, PCF method, PCF display unchanged */}
                  {/* ... */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs"
                      onClick={e => handleExportClick(product, e)}
                    >
                      <FileDown className="w-3 h-3" />
                      Export
                    </Button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(product.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      disabled={isDeleting}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Mobile empty-state */}
              {paginatedProducts.length === 0 && !dataLoading && (
                <p className="text-center text-gray-500">
                  {searchQuery.length > 0 && searchQuery.length < 4
                    ? "Please enter at least 4 characters to search."
                    : "No products found."}
                </p>
              )}
            </div>

            {/* Pagination controls */}
            {products.length > 0 && (
              <div className="flex justify-between items-center mt-4">
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
            )}
          </>
        )}
      </Card>

      {/* Export modal */}
      {showExportModal && selectedProductForExport && companyId && (
        <ExportModal
          isOpen={showExportModal}
          onClose={handleExportModalClose}
          product={selectedProductForExport}
          companyId={companyId}
        />
      )}

      {/* AI modal (confirm → loading → result) */}
      {aiModalStep && (
        <Modal
          title={
            aiModalStep === "confirm"
              ? "Send product data to AI?"
              : aiModalStep === "loading"
                ? "Generating AI Advice..."
                : `AI Advice for ${pendingProductName}`
          }
          onClose={() => {
            setAiModalStep(null);
            setAiAdvice(null);
            setPendingProductId(null);
            setUserPromptInput(""); // 입력창 초기화
          }}
        >
          {aiModalStep === "confirm" && (
            <>
              <p className="text-sm text-gray-800 whitespace-pre-line mb-2">
                You're about to request AI-generated recommendations for:{" "}
                <strong>{pendingProductName}</strong>
              </p>

              <textarea
                value={userPromptInput}
                onChange={e => setUserPromptInput(e.target.value)}
                placeholder="Ask a specific question about this product..."
                className="w-full border rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />

              <div className="flex justify-end gap-2">
                <Button
                  onClick={async () => {
                    if (pendingProductId !== null) {
                      await handleRequestProductAdvice(pendingProductId, userPromptInput);
                    }
                  }}
                >
                  Send to AI
                </Button>
              </div>
            </>
          )}

>>>>>>> main
          {aiModalStep === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
              <p className="text-sm text-gray-600">AI is thinking, please wait...</p>
            </div>
          )}

          {aiModalStep === "result" && aiAdvice && (
            <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-100">
              <ReactMarkdown>{aiAdvice}</ReactMarkdown>
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {toDeleteProduct && (
        <Modal
          title="Confirm Delete Product"
          confirmationRequiredText={toDeleteProduct.name}
          confirmLabel="Delete Product"
          onConfirm={confirmDelete}
          onClose={() => {
            setToDeleteProduct(null);
            setConfirmInput("");
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this product? This action will:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>
                Permanently delete <strong>{toDeleteProduct.name}</strong> and remove it from your
                company.
              </li>
            </ul>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
