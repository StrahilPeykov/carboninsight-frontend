import { useEmissionsTreeData } from "./useEmissionsTreeData";
import { useExportModal } from "./useExportModal";
import { useAIModal } from "./useAIModal";
import { useDeleteModal } from "./useDeleteModal";

// Main composite hook that combines all emissions tree state management
// This hook orchestrates the various modal states and core data management
// by composing smaller, focused hooks for better maintainability and separation of concerns
export function useEmissionsTreeState() {
  // Core data and authentication state
  const coreData = useEmissionsTreeData();
  
  // Modal state management hooks
  const exportModal = useExportModal();
  const aiModal = useAIModal();
  const deleteModal = useDeleteModal();

  return {
    // Core data and auth state
    ...coreData,
    // Export modal state
    ...exportModal,
    // AI modal state
    ...aiModal,
    // Delete modal state
    ...deleteModal,
  };
}