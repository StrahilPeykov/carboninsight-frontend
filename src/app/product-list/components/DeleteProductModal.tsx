import { useRouter } from "next/navigation";
import Modal from "@/app/components/ui/PopupModal";
import { Product } from "@/lib/api/productApi";

/**
 * Props interface for the DeleteProductModal component
 *
 * @property isOpen - Controls visibility of the modal
 * @property toDeleteProduct - The product that will be deleted
 * @property deleteSuccess - Indicates if deletion was successful
 * @property deleteError - Error message if deletion failed
 * @property isDeleting - Indicates if deletion is in progress
 * @property displaySuccessModal - Whether to show success confirmation (optional)
 * @property setIsDeleting - Function to update delete-in-progress state
 * @property setDeleteSuccess - Function to update success state
 * @property setDeleteError - Function to update error message
 * @property setToDeleteProduct - Function to update the product being deleted
 * @property onModalClose - Optional custom close handler
 * @property onDeleteSuccess - Optional callback when deletion succeeds
 */
interface DeleteProductModalProps {
  isOpen: boolean;
  toDeleteProduct: Product | null;
  deleteSuccess: boolean;
  deleteError: string;
  isDeleting: boolean;
  displaySuccessModal?: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
  setDeleteSuccess: (success: boolean) => void;
  setDeleteError: (error: string) => void;
  setToDeleteProduct: (product: Product | null) => void;
  onModalClose?: () => void;
  onDeleteSuccess?: () => void;
}

/**
 * Handles the product deletion process including state management
 */
export const confirmDelete = async ({
  toDeleteProduct,
  setIsDeleting,
  setDeleteSuccess,
  setDeleteError,
  onDeleteSuccess,
  router,
}: {
  toDeleteProduct: any;
  onDeleteSuccess?: () => void;
  setIsDeleting: (isDeleting: boolean) => void;
  setDeleteSuccess: (isSuccess: boolean) => void;
  setDeleteError: (error: string) => void;
  router: any;
}) => {
  // Guard clause: exit if no product is provided
  if (!toDeleteProduct) return;

  // Update UI to show deletion in progress
  setIsDeleting(true);

  try {
    // Retrieve authentication token and company ID from localStorage
    // Using typeof check for SSR compatibility
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const company_pk =
      typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;

    // Redirect to login if authentication is missing
    if (!token || !company_pk) {
      router.push("/login");
      return;
    }

    // Make API call to delete the product
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/companies/${company_pk}/products/${toDeleteProduct.id}/`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );

    // Handle API errors with improved error message extraction
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.detail || "Failed to delete product");
    }

    // Update UI to show success state
    setDeleteSuccess(true);

    // Execute optional success callback if provided
    if (onDeleteSuccess) onDeleteSuccess();

    // Redirect to product list page after short delay for UX
    setTimeout(() => {
      router.push("/product-list");
    }, 2000);
  } catch (e) {
    // Log error to console for debugging
    console.error("Error deleting product:", e);

    // Update UI to show error state with user-friendly message
    setDeleteError("Failed to delete product. Please try again.");

    // Reset deletion in progress state
    setIsDeleting(false);
  }
};

/**
 * Modal component for confirming and handling product deletion
 *
 * Displays a confirmation dialog before deletion and a success message after.
 * Handles error states and provides user feedback throughout the deletion process.
 */
export default function DeleteProductModal({
  isOpen,
  toDeleteProduct,
  deleteSuccess,
  deleteError,
  displaySuccessModal,
  setIsDeleting,
  setDeleteSuccess,
  setDeleteError,
  setToDeleteProduct,
  onModalClose,
  onDeleteSuccess,
}: DeleteProductModalProps) {
  const router = useRouter();

  // Don't render the modal if it's closed, no product selected,
  // or deletion was successful but we don't want to show a success message
  if (!isOpen || !toDeleteProduct || (deleteSuccess && displaySuccessModal === false)) return null;

  return (
    <Modal
      // Dynamic title based on deletion state
      title={deleteSuccess ? "Product Deleted" : "Confirm Delete Product"}
      // Only require confirmation text input before deletion
      confirmationRequiredText={!deleteSuccess ? toDeleteProduct.name : undefined}
      // Only show confirm button before deletion
      confirmLabel={!deleteSuccess ? "Delete Product" : undefined}
      // Handle confirmation action - only available pre-deletion
      onConfirm={
        !deleteSuccess
          ? () =>
              confirmDelete({
                toDeleteProduct,
                setIsDeleting,
                setDeleteSuccess,
                setDeleteError,
                router,
                onDeleteSuccess,
              })
          : undefined
      }
      // Handle modal close action with custom or default behavior
      onClose={
        onModalClose ||
        (() => {
          if (deleteSuccess) {
            router.push("/product-list");
          } else {
            setToDeleteProduct(null);
            setDeleteError("");
          }
        })
      }
    >
      {deleteSuccess ? (
        // Success state - show confirmation message after successful deletion
        <div className="text-center py-4" role="alert" aria-live="assertive">
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Successfully deleted</p>
          <p className="text-sm text-gray-500 dark:text-white">
            <strong>{toDeleteProduct.name}</strong> has been permanently deleted.
          </p>
        </div>
      ) : (
        // Confirmation state - show warning and request confirmation before deletion
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this product? This action will:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>
              Permanently delete <strong>{toDeleteProduct.name}</strong> and remove it from your company.
            </li>
          </ul>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">This action cannot be undone.</p>
          {/* Display error message if deletion failed */}
          {deleteError && (
            <p className="text-sm font-medium text-red-600 mt-2" role="alert">
              {deleteError}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
