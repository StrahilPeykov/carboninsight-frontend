"use client";

// Import React core hooks for state management and side effects
import { Suspense } from "react";
// Import UI components
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import AuditLog from "@/app/components/ui/AuditLog";
import * as Helpers from "../helpers";
import { useEmissionsTreeState } from "./hooks/useEmissionsTreeState";
import { ProductDetailsCard } from "./components/ProductDetailsCard";
import { EmissionsBreakdownCard } from "./components/EmissionsBreakdownCard";
import { ModalManager } from "./components/ModalManager";

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
  const {
    isLoading,
    dataLoading,
    error,
    emissions,
    product,
    logItems,
    companyId,
    router,
    showExportModal,
    setShowExportModal,
    selectedProductForExport,
    setSelectedProductForExport,
    pendingProductId,
    setPendingProductId,
    pendingProductName,
    setPendingProductName,
    aiModalStep,
    setAiModalStep,
    aiAdvice,
    setAiAdvice,
    userPromptInput,
    setUserPromptInput,
    toDeleteProduct,
    setToDeleteProduct,
    isDeleting,
    setIsDeleting,
    deleteSuccess,
    setDeleteSuccess,
    deleteError,
    setDeleteError,
  } = useEmissionsTreeState();

  // Show loading state while authentication or data is being fetched
  // This handles both initial authentication verification through the useAuth hook
  // and subsequent data loading from the emissions tree API. The loading state
  // ensures users see a skeleton UI instead of empty content during async operations,
  // providing better UX and preventing layout shifts when data arrives.
  if (isLoading || dataLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LoadingSkeleton />
      </div>
    );
  }

  // Show error state if something went wrong
  // This catches and displays any errors that occur during authentication, API calls,
  // or data processing. Error scenarios include network failures, invalid product IDs,
  // unauthorized access, server errors, or missing data. The error state provides
  // a user-friendly message with context about what failed and includes a navigation
  // option to go back to the previous page. The error display uses proper ARIA
  // attributes for accessibility and screen reader support.
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
  // This section displays the complete emissions tree interface with all product information,
  // emissions data, and interactive components. The layout is structured with a semantic
  // header containing the product name and description, followed by the main content areas
  // including product details card with action buttons, modal manager for user interactions,
  // emissions breakdown visualization table, and comprehensive audit log section. All
  // components are properly organized with accessibility attributes and responsive design
  // to ensure optimal user experience across different devices and screen readers.
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
        <ProductDetailsCard
          product={product}
          isDeleting={isDeleting}
          onExport={(product, event) => Helpers.handleProductExport({
            product,
            event,
            setSelectedProductForExport,
            setShowExportModal
          })}
          onAIAdvice={(productId, productName, event) => {
            event.stopPropagation();
            Helpers.initiateAIAdvice({
              productId,
              productName,
              setPendingProductId,
              setPendingProductName,
              setAiModalStep
            });
          }}
          onEdit={(productId, event) => {
            event.stopPropagation();
            Helpers.navigateToProductEdit({
              id: productId,
              router
            });
          }}
          onDelete={(product, event) => {
            event.stopPropagation();
            Helpers.setupProductDeletion({
              product,
              setToDeleteProduct
            });
          }}
        />
      )}

      {/* Modal Manager - handles all modal interactions */}
      <ModalManager
        showExportModal={showExportModal}
        selectedProductForExport={selectedProductForExport}
        companyId={companyId}
        setShowExportModal={setShowExportModal}
        setSelectedProductForExport={setSelectedProductForExport}
        aiModalStep={aiModalStep}
        pendingProductName={pendingProductName}
        aiAdvice={aiAdvice}
        userPromptInput={userPromptInput}
        setUserPromptInput={setUserPromptInput}
        setAiModalStep={setAiModalStep}
        setAiAdvice={setAiAdvice}
        setPendingProductId={setPendingProductId}
        pendingProductId={pendingProductId}
        product={product}
        setPendingProductName={setPendingProductName}
        toDeleteProduct={toDeleteProduct}
        deleteSuccess={deleteSuccess}
        deleteError={deleteError}
        isDeleting={isDeleting}
        setIsDeleting={setIsDeleting}
        setDeleteSuccess={setDeleteSuccess}
        setDeleteError={setDeleteError}
        setToDeleteProduct={setToDeleteProduct}
      />

      {/* Emissions Breakdown Card - core visualization of emissions data */}
      <EmissionsBreakdownCard emissions={emissions} />

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
