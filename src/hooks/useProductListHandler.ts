import { useCallback } from "react";
import { Product } from "@/lib/api/productApi";
import { useRouter } from "next/navigation";
import * as Helpers from "@/app/product-list/helpers";

// ──────────────────────────────────────────────────────────────
// This hook encapsulates all event handlers for the Product List
// page including import, export, delete, AI advice, and routing.
// It helps maintain cleaner component code by separating logic.
// ──────────────────────────────────────────────────────────────

type Params = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  router: ReturnType<typeof useRouter>;
  setError: (msg: string) => void;
  setImportNotice: (msg: string | null) => void;
  setImportErrors: (e: { attr: string; detail: string }[]) => void;
  setDataLoading: (val: boolean) => void;
  setSelectedProductForExport: (p: Product | null) => void;
  setShowExportModal: (val: boolean) => void;
  setToDeleteProduct: (p: Product | null) => void;
  setPendingProductId: (id: string | null) => void;
  setPendingProductName: (name: string) => void;
  setAiModalStep: (step: "confirm" | "loading" | "result" | null) => void;
};

export function useProductListHandlers({
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
}: Params) {
  // Handle the AI button click: prepares product info for the AI modal
  const handleAIButtonClick = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    setPendingProductId(productId);
    setPendingProductName(product?.name ?? "");
    setAiModalStep("confirm");
  }, [products]);

  // Handle file input change for AASX/CSV import
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: "aasx" | "csv") => {
    if (e.target.files?.[0]) {
      Helpers.handleFileUpload({
        file: e.target.files[0],
        type,
        router,
        setImportNotice,
        setImportErrors,
        setError,
        setDataLoading,
        setProducts,
      });
    }
  }, []);

  // Handle delete button: sets product to delete state
  const handleDelete = useCallback((id: string) => {
    const prod = products.find(p => p.id === id) ?? null;
    setToDeleteProduct(prod);
  }, [products]);

  // Handle edit button: navigates to product edit page
  const handleEdit = useCallback((id: string) => {
    router.push(`/product-list/product?product_id=${id}`);
  }, []);

  // Handle export button: shows export modal with selected product
  const handleExportClick = useCallback((product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProductForExport(product);
    setShowExportModal(true);
  }, []);

  // Handle closing of export modal: resets modal state
  const handleExportModalClose = useCallback(() => {
    setShowExportModal(false);
    setSelectedProductForExport(null);
  }, []);

  // Handle row click: navigates to emissions tree page for product
  const handleProductClick = useCallback((id: string) => {
    router.push(`/product-list/emissions-tree/?id=${id}`);
  }, []);

  // Return all handlers for use in ProductListPage
  return {
    handleAIButtonClick,
    handleInputChange,
    handleDelete,
    handleEdit,
    handleExportClick,
    handleExportModalClose,
    handleProductClick,
  };
}