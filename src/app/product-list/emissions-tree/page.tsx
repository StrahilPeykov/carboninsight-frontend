"use client";

// Import React core hooks for state management and side effects
import { useEffect, useState } from "react";
// Import Next.js navigation hooks
import { useRouter, useSearchParams } from "next/navigation";
// Import UI components
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ExportModal from "../../components/ui/ExportModal";
// Import icons from Lucide library
import { Edit, Trash, FileDown, Sparkles } from "lucide-react";
// Import authentication context hook
import { useAuth } from "../../context/AuthContext";
// Import emissions visualization component
import { EmissionsTable } from "./EmissionsTable";
// Import loading state component
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
// Import Suspense for better loading handling
import { Suspense } from "react";
// Import audit log component for tracking changes
import AuditLog from "@/app/components/ui/AuditLog";
// Import type definitions for API responses
import { LogItem } from "@/lib/api/auditLogApi";
import { EmissionTrace, Product } from "@/lib/api/productApi";
// Import helper functions for product operations
import * as Helpers from "../helpers";
// Import AI advice modal for suggestions
import AIAdviceModal from "../components/AIAdviceModal";
// Import delete confirmation modal
import DeleteProductModal from "../components/DeleteProductModal";
// Import data fetching service
import { fetchEmissionsTreeData } from "./emissionsTreeService";

// Main content component for emissions tree visualization page that displays detailed carbon
// footprint information for products. This component handles authentication verification,
// data fetching from the API, state management for product details, emissions data, and
// audit logs. It provides interactive features including product editing, deletion, data
// export capabilities, and AI-powered recommendations for emission reduction. The component
// renders a responsive layout with detailed product information cards, emissions breakdown
// visualizations, and a comprehensive audit trail. It also manages multiple modal interfaces
// for user interactions and implements loading states, error handling, and accessibility features
// to ensure a robust user experience. This serves as the primary display interface within the
// product emissions tracking system, supporting sustainability reporting and carbon footprint
// analysis workflows.
function EmissionsTreePageContent() {
  // Get authentication state and helper functions
  const { isLoading, requireAuth } = useAuth();

  // Ensure user is authenticated before accessing this page
  requireAuth();

  // Initialize router for navigation
  const router = useRouter();
  // Track loading state for data fetching
  const [dataLoading, setDataLoading] = useState(true);
  // Store any error messages
  const [error, setError] = useState("");
  // Store emissions data structure
  const [emissions, setEmissions] = useState<EmissionTrace | null>(null);
  // Store product details
  const [product, setProduct] = useState<Product | null>(null);
  // Store audit log entries
  const [logItems, setLogItems] = useState<LogItem[]>([]);
  // Access URL search parameters
  const searchParams = useSearchParams();
  // Store company ID
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Extract product ID from URL search parameters
  const productId = searchParams.get("id");

  // Controls the visibility state of the export modal dialog - when true, the modal is displayed to the user
  const [showExportModal, setShowExportModal] = useState(false);

  // Stores the currently selected product object that will be exported when the export process is confirmed
  const [selectedProductForExport, setSelectedProductForExport] = useState<Product | null>(null);

  // Tracks the ID of the product currently being processed for AI recommendations - null when no product is pending
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  // Stores the name of the product for which AI advice is being requested - used in the AI modal interface
  const [pendingProductName, setPendingProductName] = useState<string>("");
  // Manages the multi-step AI advice workflow - can be "confirm" (user confirmation), "loading" (fetching advice), "result" (displaying advice), or null (modal closed)
  const [aiModalStep, setAiModalStep] = useState<"confirm" | "loading" | "result" | null>(null);
  // Stores the AI-generated recommendation text returned from the API - displayed to the user in the results step
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  // Captures the custom prompt text that the user inputs to guide the AI recommendation engine
  const [userPromptInput, setUserPromptInput] = useState<string>("");

  // Holds the reference to the product that has been selected for deletion - used by the confirmation dialog
  const [toDeleteProduct, setToDeleteProduct] = useState<Product | null>(null);
  // Tracks whether a product deletion operation is currently in progress - used to disable UI elements during deletion
  const [isDeleting, setIsDeleting] = useState(false);
  // Indicates whether the most recent deletion attempt completed successfully - used for success messaging
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  // Stores any error message encountered during the product deletion process - displayed to the user
  const [deleteError, setDeleteError] = useState("");

  // API endpoint configuration with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  // Fetch emissions tree data when component mounts or dependencies change
  useEffect(() => {
    if (!isLoading) {
      // Call the data fetching service with all required parameters
      fetchEmissionsTreeData({
        searchParams,
        productId,
        setDataLoading,
        setError,
        setCompanyId,
        setEmissions,
        setProduct,
        setLogItems
      });
    }
  }, [API_URL, router, isLoading, searchParams, productId]);

  // Show loading state while authentication or data is being fetched
  if (isLoading || dataLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-6" role="alert" aria-live="assertive">
          <p className="text-red-600 dark:text-red-400 mb-4 font-semibold">Error: {error}</p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Failed to load product information.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Main content render when data is successfully loaded
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header with product name and description */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {product?.name || "Product Emissions"}
        </h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          Detailed carbon footprint analysis and emission breakdown
        </p>
      </header>

      {/* Product Details Card - shows key information about the product */}
      {product && (
        <Card className="mb-6" as="section" aria-labelledby="product-details-heading">
          <div className="flex justify-between items-center mb-4">
            <h2 id="product-details-heading" className="text-xl font-semibold">
              Product Details
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Two-column detail section for product information */}
            <div className="flex-1 flex flex-col md:flex-row gap-8">
              {/* Left column - basic product information */}
              <div className="flex-1 space-y-2">
                <div>
                  <span className="font-semibold">Supplier:</span>
                  <span className="ml-1">{product.supplier_name || "—"}</span>
                </div>
                <div>
                  <span className="font-semibold">Manufacturer:</span>
                  <span className="ml-1">{product.manufacturer_name || "—"}</span>
                </div>
                <div>
                  <span className="font-semibold"><abbr title="Stock Keeping Unit">SKU</abbr>:</span>
                  <span className="ml-1">{product.sku || "—"}</span>
                </div>
                <div>
                  <span className="font-semibold">Public:</span>
                  <span className="ml-1">{product.is_public ? "Yes" : "No"}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold">Description:</span>
                  <span className="ml-1">{product.description}</span>
                </div>
              </div>

              {/* Right column - emissions metrics */}
              <div className="flex-1 space-y-2">
                <div>
                  <span className="font-semibold">Total emissions:</span>
                  <span className="ml-1" aria-label={`${product.emission_total} kilograms CO2 equivalent`}>
                    {product.emission_total} kg CO₂-eq
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Biogenic emissions:</span>
                  <span className="ml-1" aria-label={`${product.emission_total_biogenic} kilograms CO2 equivalent biogenic`}>
                    {product.emission_total_biogenic} kg CO₂-eq
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Non-biogenic emissions:</span>
                  <span className="ml-1" aria-label={`${product.emission_total_non_biogenic} kilograms CO2 equivalent non-biogenic`}>
                    {product.emission_total_non_biogenic} kg CO₂-eq
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons for product operations */}
            <div className="flex flex-row md:flex-col justify-start gap-2 md:min-w-[120px]">
              {/* Export button - allows downloading product data */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs hover:cursor-pointer w-full"
                onClick={e => Helpers.handleProductExport({
                  product,
                  event: e,
                  setSelectedProductForExport,
                  setShowExportModal
                })}
                aria-label={`Export data for ${product.name}`}
              >
                <FileDown className="w-3 h-3" aria-hidden="true" />
                <span>Export</span>
              </Button>

              {/* Ask AI button - triggers AI recommendation flow */}
              <Button
                variant="outline"
                size="sm"
                className="group flex items-center gap-1 text-xs hover:bg-gradient-to-r from-purple-500 to-blue-500 hover:text-white hover:cursor-pointer w-full"
                onClick={e => {
                  e.stopPropagation();
                  Helpers.initiateAIAdvice({
                    productId: product.id,
                    productName: product?.name ?? "",
                    setPendingProductId,
                    setPendingProductName,
                    setAiModalStep
                  });
                }}
                aria-label={`Get AI recommendations for ${product.name}`}
              >
                <Sparkles className="w-3 h-3 text-purple-500 group-hover:text-white" aria-hidden="true" />
                Ask AI
              </Button>

              {/* Edit button - navigates to product edit page */}
              <Button
                size="sm"
                className="flex items-center gap-1 text-xs !bg-blue-500 !border-blue-500 !text-white hover:cursor-pointer w-full"
                onClick={e => {
                  e.stopPropagation();
                  Helpers.navigateToProductEdit({
                    id: product.id,
                    router
                  });
                }}
                aria-label={`Edit ${product.name}`}
              >
                <Edit className="w-4 h-4" aria-hidden="true" />
                Edit
              </Button>

              {/* Delete button - initiates product deletion flow */}
              <Button
                size="sm"
                className="flex items-center gap-1 text-xs !bg-red-500 !border-red-500 !text-white hover:cursor-pointer w-full"
                onClick={e => {
                  e.stopPropagation();
                  Helpers.setupProductDeletion({
                    product,
                    setToDeleteProduct
                  });
                }}
                disabled={isDeleting}
                aria-label={`Delete ${product.name}`}
              >
                <Trash className="w-4 h-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Export modal - conditionally rendered when export is triggered */}
      {showExportModal && selectedProductForExport && companyId && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => Helpers.closeExportModal({
            setShowExportModal,
            setSelectedProductForExport
          })}
          product={selectedProductForExport}
          companyId={companyId}
        />
      )}

      {/* AI advice modal - handles different steps of AI interaction */}
      <AIAdviceModal
        isOpen={aiModalStep !== null}
        onClose={() => {
          // Reset AI modal state when closing
          setAiModalStep(null);
          setAiAdvice(null);
          setPendingProductId(null);
          setUserPromptInput("");
        }}
        step={aiModalStep}
        productName={pendingProductName}
        aiAdvice={aiAdvice}
        userPromptInput={userPromptInput}
        setUserPromptInput={setUserPromptInput}
        onRequestAdvice={async (prompt) => {
          // Process AI advice request when user confirms
          if (pendingProductId !== null) {
            await Helpers.handleRequestProductAdvice({
              productId: pendingProductId,
              prompt,
              productName: product?.name || "",
              setAiModalStep,
              setAiAdvice,
              setPendingProductName
            });
          }
        }}
      />

      {/* Delete Confirmation Modal - shown when delete is triggered */}
      <DeleteProductModal
        isOpen={!!toDeleteProduct}
        toDeleteProduct={toDeleteProduct}
        deleteSuccess={deleteSuccess}
        deleteError={deleteError}
        displaySuccessModal={true}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        setDeleteSuccess={setDeleteSuccess}
        setDeleteError={setDeleteError}
        setToDeleteProduct={setToDeleteProduct}
      />

      {/* Emissions Breakdown Card - core visualization of emissions data */}
      <Card className="mb-6" as="section" aria-labelledby="emissions-breakdown-heading">
        <div className="flex justify-between items-center mb-4">
          <h2 id="emissions-breakdown-heading" className="text-xl font-semibold">
            Emissions Breakdown
          </h2>
        </div>

        {/* Render emissions table if data is available, otherwise show message */}
        {emissions && emissions.children.length > 0 ? (
          <div role="region" aria-label="Interactive emissions breakdown table">
            <EmissionsTable emissions={emissions} />
          </div>
        ) : (
          <div className="text-center py-6" role="status">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No detailed emission data available.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Emission data may still be processing or unavailable for this product.
            </p>
          </div>
        )}
      </Card>

      {/* Audit Log Section - displays history of changes to the product */}
      <section aria-labelledby="audit-log-heading">
        <AuditLog
          caption="Audit log displaying all changes and access events for this product"
          logItems={logItems}
        />
      </section>
    </div>
  );
}

// Main page component with Suspense wrapper for better loading experience
export default function EmissionsTreePage() {
  return (
    <Suspense
      fallback={
        // Loading fallback UI shown while the main content is loading
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" role="status" aria-live="polite">
            <LoadingSkeleton />
            <span className="sr-only">Loading emissions data...</span>
          </div>
        </div>
      }
    >
      <EmissionsTreePageContent />
    </Suspense>
  );
}
