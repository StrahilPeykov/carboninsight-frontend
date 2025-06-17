import { useRouter } from "next/navigation";
import Modal from "../../components/ui/PopupModal";
import * as Helpers from "../emissions-tree/helpers";
import { Product } from "@/lib/api/productApi";

interface DeleteProductModalProps {
  isOpen: boolean;
  toDeleteProduct: Product | null;
  deleteSuccess: boolean;
  deleteError: string;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
  setDeleteSuccess: (success: boolean) => void;
  setDeleteError: (error: string) => void;
  setToDeleteProduct: (product: Product | null) => void;
  setConfirmInput: (input: string) => void;
}

export default function DeleteProductModal({
  isOpen,
  toDeleteProduct,
  deleteSuccess,
  deleteError,
  isDeleting,
  setIsDeleting,
  setDeleteSuccess,
  setDeleteError,
  setToDeleteProduct,
  setConfirmInput
}: DeleteProductModalProps) {
  const router = useRouter();
  
  if (!isOpen || !toDeleteProduct) return null;

  return (
    <Modal
      title={deleteSuccess ? "Product Deleted" : "Confirm Delete Product"}
      confirmationRequiredText={!deleteSuccess ? toDeleteProduct.name : undefined}
      confirmLabel={!deleteSuccess ? "Delete Product" : undefined}
      onConfirm={
        !deleteSuccess 
          ? () => Helpers.confirmDelete({
              toDeleteProduct,
              setIsDeleting,
              setDeleteSuccess,
              setDeleteError, 
              router
            })
          : undefined
      }
      onClose={() => {
        if (deleteSuccess) {
          router.push("/product-list");
        } else {
          setToDeleteProduct(null);
          setConfirmInput("");
          setDeleteError("");
        }
      }}
    >
      {deleteSuccess ? (
        <div className="text-center py-4" role="alert" aria-live="assertive">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Successfully deleted</p>
          <p className="text-sm text-gray-500">
            <strong>{toDeleteProduct.name}</strong> has been permanently deleted.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Redirecting to product list...
          </p>
        </div>
      ) : (
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