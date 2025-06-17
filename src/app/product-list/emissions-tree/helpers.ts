/**
 * Handles the product deletion process including state management
 */
export const confirmDelete = async ({
  toDeleteProduct,
  setIsDeleting,
  setDeleteSuccess,
  setDeleteError,
  router
}: {
  toDeleteProduct: any;
  setIsDeleting: (isDeleting: boolean) => void;
  setDeleteSuccess: (isSuccess: boolean) => void;
  setDeleteError: (error: string) => void;
  router: any;
}) => {
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

    // Show success message
    setDeleteSuccess(true);
    
    // Redirect after a short delay
    setTimeout(() => {
      router.push("/product-list");
    }, 1500);

  } catch (e) {
    console.error("Error deleting product:", e);
    setDeleteError("Failed to delete product. Please try again.");
    setIsDeleting(false);
  }
};

/**
 * Handles AI product advice requests including state management
 */
export const requestProductAdvice = async ({
  productId,
  prompt,
  product,
  setAiModalStep,
  setAiAdvice,
  setPendingProductName
}: {
  productId: string;
  prompt: string;
  product: any | null;
  setAiModalStep: (step: "confirm" | "loading" | "result" | null) => void;
  setAiAdvice: (advice: string | null) => void;
  setPendingProductName: (name: string) => void;
}) => {
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

    setAiAdvice(data.response);
    setPendingProductName(product?.name ?? "this product");
    setAiModalStep("result");
  } catch (err) {
    console.error("Failed to request AI advice", err);
    setAiModalStep(null);
    setAiAdvice(null);
  }
};

/**
 * Handles initiating the export workflow
 */
export const handleProductExport = ({
  product,
  event,
  setSelectedProductForExport,
  setShowExportModal
}: {
  product: any;
  event: React.MouseEvent;
  setSelectedProductForExport: (product: any) => void;
  setShowExportModal: (show: boolean) => void;
}) => {
  event.stopPropagation();
  setSelectedProductForExport(product);
  setShowExportModal(true);
};

/**
 * Handles closing the export modal
 */
export const closeExportModal = ({
  setShowExportModal,
  setSelectedProductForExport
}: {
  setShowExportModal: (show: boolean) => void;
  setSelectedProductForExport: (product: any | null) => void;
}) => {
  setShowExportModal(false);
  setSelectedProductForExport(null);
};

/**
 * Sets up the AI advisor modal state
 */
export const initiateAIAdvice = ({
  productId,
  productName,
  setPendingProductId,
  setPendingProductName,
  setAiModalStep
}: {
  productId: string;
  productName: string;
  setPendingProductId: (id: string | null) => void;
  setPendingProductName: (name: string) => void;
  setAiModalStep: (step: "confirm" | "loading" | "result" | null) => void;
}) => {
  setPendingProductId(productId);
  setPendingProductName(productName);
  setAiModalStep("confirm");
};

/**
 * Navigates to the product edit page
 */
export const navigateToProductEdit = ({
  id,
  router
}: {
  id: string;
  router: any;
}) => {
  router.push(`/product-list/product?product_id=${id}`);
};

/**
 * Prepares the product deletion workflow
 */
export const setupProductDeletion = ({
  product,
  setToDeleteProduct,
  setConfirmInput
}: {
  product: any;
  setToDeleteProduct: (product: any) => void;
  setConfirmInput: (input: string) => void;
}) => {
  setToDeleteProduct(product);
  setConfirmInput("");
};