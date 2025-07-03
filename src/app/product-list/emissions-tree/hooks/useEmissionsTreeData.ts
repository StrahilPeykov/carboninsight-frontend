import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { LogItem } from "@/lib/api/auditLogApi";
import { EmissionTrace, Product } from "@/lib/api/productApi";
import { fetchEmissionsTreeData } from "../emissionsTreeService";

// Custom hook for managing core emissions tree data state
// Handles authentication, data loading, and error states for the emissions tree page
// This hook centralizes the primary data fetching logic and provides loading/error states
export function useEmissionsTreeData() {
  // Authentication hook providing loading state and auth enforcement function
  const { isLoading, requireAuth } = useAuth();
  // Next.js router for programmatic navigation and back button functionality
  const router = useRouter();
  // URL search parameters hook for accessing query string values like product ID
  const searchParams = useSearchParams();
  
  // Core data state management
  // Loading state for API data fetching operations, starts as true until data loads
  const [dataLoading, setDataLoading] = useState(true);
  // Error message string for displaying API or authentication failures
  const [error, setError] = useState("");
  // Emissions tree data structure containing hierarchical carbon footprint information
  const [emissions, setEmissions] = useState<EmissionTrace | null>(null);
  // Product details object containing metadata and emission totals
  const [product, setProduct] = useState<Product | null>(null);
  // Array of audit log entries tracking product changes and access events
  const [logItems, setLogItems] = useState<LogItem[]>([]);
  // Company identifier for the current user's organization context
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Extract product ID from URL query parameters for data fetching
  const productId = searchParams.get("id");

  requireAuth();

  useEffect(() => {
    if (!isLoading) {
      fetchEmissionsTreeData({
        searchParams,
        productId,
        setDataLoading,
        setError,
        setCompanyId,
        setEmissions,
        setProduct,
        setLogItems
      });
    }
  }, [isLoading, searchParams, productId]);

  return {
    // Authentication state
    isLoading,
    // Core data
    dataLoading,
    error,
    emissions,
    product,
    logItems,
    companyId,
    productId,
    router,
  };
}