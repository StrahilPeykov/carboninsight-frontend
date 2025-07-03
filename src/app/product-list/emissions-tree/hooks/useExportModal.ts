import { useState } from "react";
import { Product } from "@/lib/api/productApi";

// Custom hook for managing export modal state
// Handles visibility control and product selection for the export functionality
// Provides clean state management for the product data export workflow
export function useExportModal() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProductForExport, setSelectedProductForExport] = useState<Product | null>(null);

  return {
    showExportModal,
    setShowExportModal,
    selectedProductForExport,
    setSelectedProductForExport,
  };
}