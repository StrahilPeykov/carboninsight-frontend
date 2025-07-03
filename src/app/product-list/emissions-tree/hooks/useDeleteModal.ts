import { useState } from "react";
import { Product } from "@/lib/api/productApi";

// Custom hook for managing product deletion modal state
// Handles the complete deletion workflow including confirmation, progress, success, and error states
// Provides comprehensive state management for the product removal functionality
export function useDeleteModal() {
  // Product object selected for deletion, null when no deletion is pending
  const [toDeleteProduct, setToDeleteProduct] = useState<Product | null>(null);
  // Boolean flag indicating whether deletion operation is currently in progress
  const [isDeleting, setIsDeleting] = useState(false);
  // Boolean flag indicating whether the deletion completed successfully
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  // Error message string if deletion failed, empty string when no error occurred
  const [deleteError, setDeleteError] = useState("");

  return {
    toDeleteProduct,
    setToDeleteProduct,
    isDeleting,
    setIsDeleting,
    deleteSuccess,
    setDeleteSuccess,
    deleteError,
    setDeleteError,
  };
}