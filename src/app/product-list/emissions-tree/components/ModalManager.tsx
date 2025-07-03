// Import React functional component type for TypeScript support
import { FC } from "react";
// Import export functionality modal component for product data download features
import ExportModal from "../../../components/ui/ExportModal";
// Import AI-powered advice modal component for emission reduction recommendations
import AIAdviceModal from "../../components/AIAdviceModal";
// Import delete confirmation modal component for product removal operations
import DeleteProductModal from "../../components/DeleteProductModal";
// Import Product type definition from API layer for type safety
import { Product } from "@/lib/api/productApi";
// Import helper functions for modal operations and state management
import * as Helpers from "../../helpers";

// TypeScript interface defining all props required by the ModalManager component
// This centralizes modal state management and ensures type safety across all modal interactions
// The interface is organized by modal type to improve code readability and maintenance
interface ModalManagerProps {
  // Export modal state properties for handling product data export functionality
  // Controls visibility and manages the selected product for export operations
  showExportModal: boolean;
  selectedProductForExport: Product | null;
  companyId: string | null;
  setShowExportModal: (show: boolean) => void;
  setSelectedProductForExport: (product: Product | null) => void;
  
  // AI modal state properties for managing AI-powered recommendation workflows
  // Handles multi-step AI interaction process from confirmation to results display
  aiModalStep: "confirm" | "loading" | "result" | null;
  pendingProductName: string;
  aiAdvice: string | null;
  userPromptInput: string;
  setUserPromptInput: (input: string) => void;
  setAiModalStep: (step: "confirm" | "loading" | "result" | null) => void;
  setAiAdvice: (advice: string | null) => void;
  setPendingProductId: (id: string | null) => void;
  pendingProductId: string | null;
  product: Product | null;
  setPendingProductName: (name: string) => void;
  
  // Delete modal state properties for managing product deletion confirmation and status
  // Handles the complete deletion workflow including success and error states
  toDeleteProduct: Product | null;
  deleteSuccess: boolean;
  deleteError: string;
  isDeleting: boolean;
  setIsDeleting: (deleting: boolean) => void;
  setDeleteSuccess: (success: boolean) => void;
  setDeleteError: (error: string) => void;
  setToDeleteProduct: (product: Product | null) => void;
}

// Central modal management component that orchestrates all modal interactions within the emissions tree page
// This component follows the single responsibility principle by focusing solely on modal rendering and state coordination
// It provides a clean separation of concerns by isolating modal logic from the main page component
// The component handles three distinct modal types: export, AI advice, and delete confirmation
export const ModalManager: FC<ModalManagerProps> = ({
  showExportModal,
  selectedProductForExport,
  companyId,
  setShowExportModal,
  setSelectedProductForExport,
  aiModalStep,
  pendingProductName,
  aiAdvice,
  userPromptInput,
  setUserPromptInput,
  setAiModalStep,
  setAiAdvice,
  setPendingProductId,
  pendingProductId,
  product,
  setPendingProductName,
  toDeleteProduct,
  deleteSuccess,
  deleteError,
  isDeleting,
  setIsDeleting,
  setDeleteSuccess,
  setDeleteError,
  setToDeleteProduct,
}) => {
  return (
    <>
      {/* Export modal - conditionally rendered when export is triggered */}
      {/* Only displays when all required conditions are met: modal should be shown, product is selected, and company ID exists */}
      {/* This conditional rendering pattern ensures the modal only appears with valid data and prevents rendering errors */}
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
      {/* Always rendered but controlled by isOpen prop to maintain state during step transitions */}
      {/* This approach prevents loss of user input and modal state during the multi-step AI workflow */}
      <AIAdviceModal
        isOpen={aiModalStep !== null}
        onClose={() => {
          // Reset AI modal state when closing
          // Comprehensive cleanup ensures no stale state remains after modal dismissal
          // This prevents data leakage between different AI advice sessions
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
          // Validates that a product ID exists before making the API request
          // This prevents unnecessary API calls and potential errors
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
      {/* Always rendered to maintain consistent state management across deletion workflow */}
      {/* The displaySuccessModal prop enables showing success feedback after deletion completion */}
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
    </>
  );
};