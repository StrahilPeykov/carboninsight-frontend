"use client";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Info, Trash, FileDown, Boxes, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import Modal from "../components/ui/PopupModal";
import ReactMarkdown from "react-markdown";
import ExportModal from "../components/ui/ExportModal";
import { TableRow } from "../components/ui/tableRow";

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
  pcf_calculation_method: string;
};

// Component
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
  const [mounted, setMounted] = useState(false);

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

  // Deletion confirmation state
  const [toDeleteProduct, setToDeleteProduct] = useState<Product | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Products - CarbonInsight";
  }, []);

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- NEW helper: per-row AI button click ---
  const handleAIButtonClick = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setPendingProductId(productId);
    setPendingProductName(product?.name ?? "");
    setAiModalStep("confirm");
  };

  // Init
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;

    const id = localStorage.getItem("selected_company_id");
    if (!id) {
      router.push("/list-companies");
    } else {
      setCompanyId(id);
    }
    setInitializing(false);
  }, [router, mounted]);

  // Enhanced error announcement function
  const announceError = (message: string) => {
    const errorRegion = document.getElementById("error-announcements");
    if (errorRegion) {
      errorRegion.textContent = `Error loading products: ${message}`;
    }
  };

  // Enhanced success announcement function
  const announceSuccess = (message: string) => {
    const statusRegion = document.getElementById("status-announcements");
    if (statusRegion) {
      statusRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        statusRegion.textContent = "";
      }, 3000);
    }
  };

  // Data fetch with loading announcement
  const fetchProducts = async (query = "") => {
    if (!companyId) return;

    try {
      setDataLoading(true);
      setError("");

      const statusRegion = document.getElementById("status-announcements");
      if (statusRegion) {
        statusRegion.textContent = "Loading products...";
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
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

      if (!res.ok) throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);

      const data = await res.json();
      setProducts(data);

      // Announce completion
      if (statusRegion) {
        statusRegion.textContent = `${data.length} products loaded`;
        setTimeout(() => {
          statusRegion.textContent = "";
        }, 2000);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      announceError(errorMessage);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && mounted) fetchProducts();
  }, [companyId, mounted]);

  // Debounced search
  useEffect(() => {
    if (!mounted) return;

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
  }, [searchQuery, companyId, mounted]);

  // CRUD actions

  // Opens the "type-to-confirm" modal
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
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const company_pk =
        typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;
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

      announceSuccess(`Product ${toDeleteProduct.name} deleted successfully`);
    } catch (e) {
      console.error("Error deleting product:", e);
      const errorMessage = e instanceof Error ? e.message : "Failed to delete product";
      announceError(errorMessage);
    } finally {
      setIsDeleting(false);
      setToDeleteProduct(null);
      setConfirmInput("");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/product-list/product?product_id=${id}`);
  };

  // Export workflow with announcement
  const handleExportClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProductForExport(product);
    setShowExportModal(true);
  };

  const handleExportModalClose = () => {
    setShowExportModal(false);
    setSelectedProductForExport(null);
  };

  // AI advice workflow
  const handleRequestProductAdvice = async (productId: string, prompt: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const company =
      typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;

    if (!API_URL || !token || !company) return;

    try {
      setAiModalStep("loading");

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

      const data = await res.json();
      const product = products.find(p => p.id === productId);

      setAiAdvice(data.response);
      setPendingProductName(product?.name ?? "this product");
      setAiModalStep("result");

      announceSuccess("AI analysis completed for " + (product?.name || "product"));
    } catch (err) {
      console.error("Failed to request AI advice", err);
      setAiModalStep(null);
      setAiAdvice(null);
      announceError("Failed to get AI analysis");
    }
  };

  // Row click (AI selection mode)
  const handleProductClick = (id: string) => {
    if (editMode) {
      const product = products.find(p => p.id === id);
      setPendingProductId(id);
      setPendingProductName(product?.name ?? "");
      setAiModalStep("confirm");
    } else {
      router.push(`/product-list/emissions-tree/?id=${id}`);
    }
  };

  // Pagination & slicing
  const paginatedProducts = products.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Early UI states
  if (isLoading || !mounted) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
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
          <div className="flex items-center text-sm text-gray-500 mb-2" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-500 mr-2" aria-hidden="true"></div>
            Loading product data...
          </div>
        )}

        <p className="text-gray-500 dark:text-gray-400">
          Manage your products and calculate their carbon footprint
        </p>
      </div>

      {/* Search + Add Product */}
      <div className="mb-6 flex items-center gap-2">
        <label htmlFor="product-search" className="sr-only">
          Search products by name, SKU or manufacturer
        </label>
        <input
          id="product-search"
          type="text"
          placeholder="Search by product, SKU or manufacturer name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby="search-help"
        />
        <span id="search-help" className="sr-only">
          Enter at least 4 characters to search products
        </span>
        <Button
          onClick={() => router.push(`/product-list/product`)}
          className="bg-black text-white rounded-md px-4 py-2 text-md"
          aria-label="Add new product"
        >
          Add Product
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md" role="alert" aria-live="assertive">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Table card */}
      <Card className="p-4">
        {dataLoading ? (
          <div className="flex justify-center items-center py-8" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400" aria-hidden="true"></div>
            <span className="ml-3 text-gray-500">Loading products...</span>
          </div>
        ) : error ? (
          <div role="alert" aria-live="assertive">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Desktop and tablet table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full table-auto text-base" role="table" aria-label="Products table">
                <thead>
                  <tr role="row" className="text-left border-b">
                    <th scope="col" className="p-2">Manufacturer</th>
                    <th scope="col" className="p-2">Product name</th>
                    <th scope="col" className="p-2">SKU</th>
                    <th scope="col" className="p-2">
                      <abbr title="Product Carbon Footprint">PCF</abbr>
                    </th>
                    <th scope="col" className="p-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="text-base">
                  {paginatedProducts.map(product => (
                    <TableRow
                      key={product.id}
                      editMode={editMode}
                      onClick={() => handleProductClick(product.id)}
                    >
                      <td className="p-2">{product.manufacturer_name}</td>
                      <td className="p-2">{product.name}</td>
                      <td className="p-2">{product.sku}</td>
                      <td className="p-2 flex items-center gap-1">
                        <span aria-label={`${product.emission_total} kilograms CO2 equivalent`}>
                          {product.emission_total} kg
                        </span>
                        <Info className="w-4 h-4 text-gray-400" aria-label="Product carbon footprint information" />
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-end gap-2">
                          {/* Export */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-xs"
                            onClick={e => handleExportClick(product, e)}
                            aria-label={`Export ${product.name} data`}
                          >
                            <FileDown className="w-3 h-3" aria-hidden="true" />
                            <span>Export</span>
                          </Button>

                          {/* Ask AI */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="group flex items-center gap-1 text-xs hover:bg-gradient-to-r from-purple-500 to-blue-500 hover:text-white"
                            onClick={e => {
                              e.stopPropagation();
                              handleAIButtonClick(product.id);
                            }}
                            aria-label={`Get AI recommendations for ${product.name}`}
                          >
                            <Sparkles className="w-3 h-3 text-purple-500 group-hover:text-white" aria-hidden="true" />
                            Ask AI
                          </Button>

                          {/* Edit */}
                          <Button
                            size="sm"
                            className="flex items-center gap-1 text-xs !bg-blue-500 !border-blue-500 !text-white"
                            onClick={e => {
                              e.stopPropagation();
                              handleEdit(product.id);
                            }}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit className="w-4 h-4 text-white" aria-hidden="true" />
                          </Button>

                          {/* Delete */}
                          <Button
                            size="sm"
                            className="flex items-center gap-1 text-xs !bg-red-500 !border-red-500 !text-white"
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                            disabled={isDeleting}
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash className="w-4 h-4 text-white" aria-hidden="true" />
                          </Button>

                        </div>
                      </td>
                    </TableRow>
                  ))}

                  {/* Empty state */}
                  {paginatedProducts.length === 0 && !dataLoading && (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
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
                            <Boxes className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
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
                  className="border rounded-md p-4 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${product.name}`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleProductClick(product.id);
                    }
                  }}
                >
                  <div className="mb-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {product.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p>Manufacturer: {product.manufacturer_name}</p>
                    <p>SKU: {product.sku}</p>
                    <p>Method: {product.pcf_calculation_method}</p>
                    <p className="flex items-center gap-1">
                      <span aria-label={`Product Carbon Footprint: ${product.emission_total} kilograms CO2 equivalent`}>
                        PCF: {product.emission_total}
                      </span>
                      <Info className="w-3 h-3 text-gray-400" aria-hidden="true" />
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    {/* Export */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="group flex items-center gap-1 text-xs transition-colors
                      motion-safe:hover:animate-hue
                      motion-safe:active:animate-hue-fast"
                      onClick={e => handleExportClick(product, e)}
                      aria-label={`Export ${product.name} data`}
                    >
                      <FileDown className="w-3 h-3" aria-hidden="true" />
                      <span>Export</span>
                    </Button>

                    {/* Ask AI */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="group flex items-center gap-1 text-xs transition-colors
                      motion-safe:hover:animate-hue
                      motion-safe:active:animate-hue-fast"
                      onClick={e => {
                        e.stopPropagation();
                        handleAIButtonClick(product.id);
                      }}
                      aria-label={`Get AI recommendations for ${product.name}`}
                    >
                      <Sparkles className="w-3 h-3 text-purple-500" aria-hidden="true" />
                      <span>Ask&nbsp;AI</span>
                    </Button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(product.id);
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit className="w-4 h-4 text-blue-500" aria-hidden="true" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      disabled={isDeleting}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash className="w-4 h-4 text-red-500" aria-hidden="true" />
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
                      <Boxes className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
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
              <nav className="flex justify-between items-center mt-4" aria-label="Pagination">
                <div className="flex items-center gap-2">
                  <Button
                    className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Go to previous page"
                  >
                    Previous
                  </Button>
                  <span className="text-sm" aria-current="page">
                    Page {currentPage} of {Math.ceil(products.length / rowsPerPage)}
                  </span>
                  <Button
                    className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage * rowsPerPage >= products.length}
                    aria-label="Go to next page"
                  >
                    Next
                  </Button>
                </div>
                <div>
                  <label htmlFor="rows-per-page" className="text-sm">
                    Rows per page:
                  </label>
                  <select
                    id="rows-per-page"
                    className="border rounded px-2 py-1 text-sm ml-2 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={rowsPerPage}
                    onChange={e => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    aria-label="Select number of rows per page"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </nav>
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
              <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-line mb-2">
                You're about to share product data for <strong>{pendingProductName}</strong> with
                our AI system to receive tailored carbon reduction recommendations.{"\n\n"}
                By clicking <strong>Ask AI</strong>, you consent to this use.{"\n\n"}
                You may also enter a specific question below to guide the response.{"\n\n"}
                <strong>No personal or sensitive data will be stored.</strong>
              </p>

              <label htmlFor="ai-prompt" className="block text-sm font-medium mb-2">
                Optional: Ask a specific question
              </label>
              <textarea
                id="ai-prompt"
                value={userPromptInput}
                onChange={e => setUserPromptInput(e.target.value)}
                placeholder="Ask a specific question about this product..."
                className="w-full border rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                aria-describedby="ai-prompt-help"
              />
              <div id="ai-prompt-help" className="sr-only">
                Enter a specific question to guide the AI analysis, or leave blank for general recommendations
              </div>

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

          {aiModalStep === "loading" && (
            <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4" aria-hidden="true" />
              <p className="text-sm text-gray-600">AI is thinking, please wait...</p>
            </div>
          )}

          {aiModalStep === "result" && aiAdvice && (
            <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-100" role="article" aria-label="AI recommendations">
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
