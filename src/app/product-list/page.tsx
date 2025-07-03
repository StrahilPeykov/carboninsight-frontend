"use client";

import { useProductListHandlers } from "@/hooks/useProductListHandler";
import Card from "../components/ui/Card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ExportModal from "../components/ui/ExportModal";
import { Product } from "@/lib/api/productApi";
import { useRef } from "react";
import ImportErrorCard from "../components/ui/ImportErrorCard";
import * as Helpers from "./helpers";
import AIAdviceModal from "./components/AIAdviceModal";
import DeleteProductModal from "./components/DeleteProductModal";
import ProductTable from "./components/ProductTable";
import SearchAndImportSection from './components/SearchAndImportSection';

// Set page title
if (typeof document !== "undefined") {
    document.title = "Products - CarbonInsight";
}

//
// ProductListPage - Main product management interface
//
// This page provides a comprehensive UI for managing product data in the CarbonInsight platform.
// It handles product listing, searching, creation, editing, deletion, import/export operations,
// and AI-assisted product optimization.
//
// Features:
// - Product listing with pagination and search functionality
// - Creation of new products with redirect to product form
// - Editing of existing product details
// - Deletion of products with confirmation workflow
// - Import of product data from multiple formats (AASX, JSON, XML, CSV, XLSX)
// - Export of product data to various formats
// - AI-powered analysis and recommendations for products
//
// Authentication:
// - Requires user to be authenticated via AuthContext
// - Redirects to login if authentication fails
// - Requires company selection (stored in localStorage)
//
// State management:
// - Manages complex UI states for modals, loading states, and error handling
// - Implements debounced search to optimize API calls
// - Handles pagination locally to improve performance
//
// @returns {JSX.Element} The rendered product list page with all interactive components
//
export default function ProductListPage() {

    // ── Local state declarations ─────────────────────────────────────────────
    // These hold product data, UI states, modals, and async flags
    // State used by useProductListHandlers
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState("");
    const [importNotice, setImportNotice] = useState<string | null>(null);
    const [importErrors, setImportErrors] = useState<{ attr: string; detail: string }[]>([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [selectedProductForExport, setSelectedProductForExport] = useState<Product | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [toDeleteProduct, setToDeleteProduct] = useState<Product | null>(null);
    const [pendingProductId, setPendingProductId] = useState<string | null>(null);
    const [pendingProductName, setPendingProductName] = useState<string>("");
    const [aiModalStep, setAiModalStep] = useState<"confirm" | "loading" | "result" | null>(null);

    // ── Routing & Auth setup ─────────────────────────────────────────────────
    // Page navigation and authentication context
    const router = useRouter();
    const { isLoading, requireAuth } = useAuth();

    // Require authentication
    requireAuth();

    // ── Bind product handlers with all required setters and state ────────────
    // Handlers (must come after useRouter and all state setters)
    const {
        handleAIButtonClick,
        handleInputChange,
        handleDelete,
        handleEdit,
        handleExportClick,
        handleExportModalClose,
        handleProductClick,
    } = useProductListHandlers({
        products,
        setProducts,
        router,
        setError,
        setImportNotice,
        setImportErrors,
        setDataLoading,
        setSelectedProductForExport,
        setShowExportModal,
        setToDeleteProduct,
        setPendingProductId,
        setPendingProductName,
        setAiModalStep,
    });

    // ── UI State & Control flags ─────────────────────────────────────────────
    // Various UI flags, pagination, and modal states
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [initializing, setInitializing] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // File input refs
    const [showImportDropdown, setShowImportDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // AI advice flow state
    // pendingProductId, pendingProductName, aiModalStep already declared above
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [userPromptInput, setUserPromptInput] = useState<string>("");

    // Deletion confirmation state
    // toDeleteProduct already declared above
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // ── Track if component is mounted to enable browser-only logic ──────────
    // Ensures effects run only after mount (avoids SSR/localStorage bugs)
    useEffect(() => {
        setMounted(true);
    }, []);

    // ── Detect external clicks to close import dropdown when open ───────────
    // Closes import dropdown when clicking outside the dropdown element
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click is outside the dropdown
            // If the dropdown is open and the click is outside, close the dropdown
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowImportDropdown(false);
            }
        };

        // Only add the event listener if the dropdown is open
        if (showImportDropdown) {
            // Add event listener to detect clicks outside the dropdown
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Cleanup function to remove the event listener
        return () => {
            // Remove the event listener when the component unmounts or dropdown state changes
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showImportDropdown]);


    // ── Resolve company ID from localStorage on initial load ────────────────
    // Initial company ID setup - retrieves the selected company from local storage
    useEffect(() => {
        // Skip effect if running on server-side or if component isn't mounted yet
        if (typeof window === "undefined" || !mounted) return;
        // Retrieve the selected company ID from browser's localStorage
        const id = localStorage.getItem("selected_company_id");
        // If no company ID is found, redirect user to the company selection page
        if (!id) {
            router.push("/list-companies");
        } else {
            // Store the retrieved company ID in component state
            setCompanyId(id);
        }
        // Mark initialization as complete to hide loading indicators
        setInitializing(false);
    }, [router, mounted]);

    // ── Fetch product list when company ID becomes available ────────────────
    // Fetch products on company ID change
    useEffect(() => {
        // Only fetch products when both company ID is available and component is mounted
        if (companyId && mounted) {
            Helpers.fetchProducts({
                companyId,
                onLoadingChange: setDataLoading,
                onError: setError,
                setProducts,
                onAuthError: () => router.push("/login"),
            });
        }
    }, [companyId, mounted]);

    // ── Debounced search logic (300ms delay to limit API hits) ──────────────
    // Debounced search
    useEffect(() => {
        if (!mounted) return;

        // Implement debounced search with 300ms delay to avoid excessive API calls
        const t = setTimeout(() => {
            // Skip fetching if no company is selected
            if (!companyId) return;

            // Only search when query is empty (show all) or has sufficient characters (at least 4)
            // This prevents sending too many requests for very short queries
            if (searchQuery.length === 0 || searchQuery.length >= 4) {
                Helpers.fetchProducts({
                    companyId,
                    query: searchQuery,
                    onLoadingChange: setDataLoading,
                    onError: setError,
                    setProducts,
                    onAuthError: () => router.push("/login"),
                });
                // Reset to first page when search results change
                setCurrentPage(1);
            } else {
                // Clear products when query is too short (1-3 characters)
                setProducts([]);
            }
        }, 300);

        return () => clearTimeout(t);
    }, [searchQuery, companyId, mounted]);

    // ── Local pagination (client-side slicing of products array) ────────────
    // Pagination & slicing
    const paginatedProducts = products.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // ── Early return: show loading while auth or mount not complete ─────────
    // Early UI states
    if (isLoading || !mounted) {
        return (
            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <LoadingSkeleton />
            </div>
        );
    }

    // Initializing state
    // Show loading spinner and message while company information is being initialized
    if (initializing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-600"></div>
                <span className="ml-4 text-gray-600">Loading company information...</span>
            </div>
        );
    }

    // Render the main product list page
    return (
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header  */}
            <div className="mb-4">
                <h1 className="text-3xl font-bold mb-2">Products</h1>

                <p className="text-gray-500 dark:text-gray-400">
                    Manage your products and calculate their carbon footprint
                </p>
            </div>

            {/* Search + Add Product */}
            <SearchAndImportSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleInputChange={handleInputChange}
              setError={setError}
            />

            {/* Global feedback messages (success, error, notices) */}
            {/* Success message */}
            {successMessage && (
                <div
                    className="mb-4 p-3 bg-green-100 text-green-800 rounded-md"
                    role="alert"
                    aria-live="polite"
                >
                    {successMessage}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div
                    className="mb-4 p-3 bg-red-100 text-red-800 rounded-md"
                    role="alert"
                    aria-live="assertive"
                >
                    {error}
                </div>
            )}

            {/* Notices about imports */}
            {importNotice && (
                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-sm text-blue-900 rounded-md">
                    <p className="font-bold text-blue-700 mb-1">ℹ️ Import Notice</p>
                    <p>{importNotice}</p>
                </div>
            )}

            {/* Error display */}
            {importErrors.length > 0 && (
                <div className="mb-6 space-y-4">
                    {Object.entries(
                        importErrors.reduce(
                            (acc, err) => {
                                // Extract row number from the error attribute using regex
                                // The pattern looks for digits at the start of the string
                                // If no match is found, default to "unknown" row
                                const row = err.attr.match(/^(\d+)/)?.[1] ?? "unknown";

                                // Initialize an array for this row if it doesn't exist yet
                                if (!acc[row]) acc[row] = [];

                                // Add the current error to the array for this row
                                acc[row].push(err);
                                return acc;
                            },
                            // Initialize the accumulator as an empty object with type annotation
                            {} as Record<string, { attr: string; detail: string }[]>
                        )
                        // Convert the grouped errors object to an array of [row, errors] pairs
                    ).map(([row, errors]) => (
                        // Render an ImportErrorCard component for each row with its errors
                        <ImportErrorCard key={row} row={row} errors={errors} />
                    ))}
                </div>
            )}

            {/* Product list table with pagination and all interaction handlers */}
            <Card className="p-4">
                <ProductTable
                    products={products}
                    paginatedProducts={paginatedProducts}
                    dataLoading={dataLoading}
                    error={error}
                    currentPage={currentPage}
                    rowsPerPage={rowsPerPage}
                    isDeleting={isDeleting}
                    searchQuery={searchQuery}
                    onProductClick={handleProductClick}
                    onExportClick={handleExportClick}
                    onAIButtonClick={handleAIButtonClick}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={rows => {
                        setRowsPerPage(rows);
                        setCurrentPage(1);
                    }}
                />
            </Card>

            {/* ExportModal – controls modal open state and passes relevant props */}
            {showExportModal && selectedProductForExport && companyId && (
                <ExportModal
                    isOpen={showExportModal}
                    onClose={handleExportModalClose}
                    product={selectedProductForExport}
                    companyId={companyId}
                />
            )}

            {/* AIAdviceModal – controls modal open state and passes relevant props */}
            <AIAdviceModal
                isOpen={aiModalStep !== null}
                onClose={() => {
                    // Reset modal step to close the AI advice modal
                    setAiModalStep(null);
                    // Clear any previously generated AI advice content
                    setAiAdvice(null);
                    // Clear the stored product ID that was pending for AI advice
                    setPendingProductId(null);
                    // Reset the user's prompt input field to empty string
                    setUserPromptInput("");
                }}
                step={aiModalStep}
                productName={pendingProductName}
                aiAdvice={aiAdvice}
                userPromptInput={userPromptInput}
                setUserPromptInput={setUserPromptInput}
                onRequestAdvice={async prompt => {
                    if (pendingProductId !== null) {
                        await Helpers.handleRequestProductAdvice({
                            productId: pendingProductId,
                            prompt,
                            productName: pendingProductName,
                            setAiModalStep,
                            setAiAdvice,
                            setPendingProductName,
                        });
                    }
                }}
            />

            {/* DeleteProductModal – controls modal open state and passes relevant props */}
            <DeleteProductModal
                isOpen={!!toDeleteProduct}
                toDeleteProduct={toDeleteProduct}
                deleteSuccess={deleteSuccess}
                deleteError={deleteError}
                isDeleting={isDeleting}
                displaySuccessModal={false}
                setIsDeleting={setIsDeleting}
                setDeleteSuccess={setDeleteSuccess}
                setDeleteError={setDeleteError}
                setToDeleteProduct={setToDeleteProduct}
                onDeleteSuccess={() => {
                    // This will only run after successful deletion, so we don't need another deleteSuccess check
                    if (toDeleteProduct) {
                        setProducts(products.filter(p => p.id !== toDeleteProduct.id));
                    }
                    // Set success message
                    if (toDeleteProduct) {
                        setSuccessMessage(`Product "${toDeleteProduct.name}" has been successfully deleted`);
                    }
                    // Clear success message after 5 seconds
                    setTimeout(() => setSuccessMessage(""), 5000);
                    setToDeleteProduct(null);
                    setDeleteSuccess(false);
                    setDeleteError("");
                }}
            />
        </div>
    );
}
