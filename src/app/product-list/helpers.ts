// Re-export functions from utility modules for backward compatibility
export { handleRequestProductAdvice, handleTemplateDownload, fetchProducts } from "./utils/productApiHelpers";
export { handleFileUpload } from "./utils/uploadHandlers";

// Handles initiating the export workflow
// Prevents event bubbling and sets up export modal state
// Simple state management function for product export operations
export const handleProductExport = ({
  product,
  event,
  setSelectedProductForExport,
  setShowExportModal,
}: {
  product: any;
  event: React.MouseEvent;
  setSelectedProductForExport: (product: any) => void;
  setShowExportModal: (show: boolean) => void;
}) => {
  // Prevent event bubbling to parent elements (stops row click from triggering)
  event.stopPropagation();
  // Store the selected product in state for use by the export modal
  setSelectedProductForExport(product);
  // Show the export modal dialog by updating its visibility state
  setShowExportModal(true);
};

// Handles closing the export modal
// Resets export modal state and clears selected product data
// Simple cleanup function for export modal workflow
export const closeExportModal = ({
  setShowExportModal,
  setSelectedProductForExport,
}: {
  setShowExportModal: (show: boolean) => void;
  setSelectedProductForExport: (product: any | null) => void;
}) => {
  // Hide the export modal by setting its visibility state to false
  setShowExportModal(false);
  // Clear the selected product data to prevent stale references and free memory
  setSelectedProductForExport(null);
};

// Sets up the AI advisor modal state
// Prepares product information and initiates AI advice workflow
// Simple state management function for AI modal operations
export const initiateAIAdvice = ({
  productId,
  productName,
  setPendingProductId,
  setPendingProductName,
  setAiModalStep,
}: {
  productId: string;
  productName: string;
  setPendingProductId: (id: string | null) => void;
  setPendingProductName: (name: string) => void;
  setAiModalStep: (step: "confirm" | "loading" | "result" | null) => void;
}) => {
  // Store the product ID for which AI advice is being requested
  setPendingProductId(productId);
  // Store the product name to display in the modal for better user context
  setPendingProductName(productName);
  // Set modal to confirmation step where user can review before proceeding with AI analysis
  setAiModalStep("confirm");
};

// Navigates to the product edit page
// Simple navigation helper for product editing workflow
// Uses Next.js router to navigate with proper query parameters
export const navigateToProductEdit = ({ id, router }: { id: string; router: any }) => {
  router.push(`/product-list/product?product_id=${id}`);
};

// Prepares the product deletion workflow
// Sets up deletion modal state with selected product
// Simple state management function for deletion operations
export const setupProductDeletion = ({
  product,
  setToDeleteProduct
}: {
  product: any;
  setToDeleteProduct: (product: any) => void;
}) => {
  setToDeleteProduct(product);
};
