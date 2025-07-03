// This module provides data fetching services for the Emissions Tree visualization page.
// It centralizes the complex API calling logic to keep the component clean and focused on UI rendering.

// Import React types for state management functions
import { Dispatch, SetStateAction } from "react";
// Import Next.js navigation type for accessing URL parameters safely
import { ReadonlyURLSearchParams } from "next/navigation";
// Import API client modules and type definitions for audit log data
import { auditLogApi, LogItem } from "@/lib/api/auditLogApi";
// Import API client modules and type definitions for product and emission data
import { productApi, EmissionTrace, Product } from "@/lib/api/productApi";

// Define the parameter interface for the fetchEmissionsTreeData function
// This ensures type safety and documents all required parameters in a single place
interface FetchEmissionsTreeDataParams {
  // URL search parameters containing query string values like product and company IDs
  searchParams: ReadonlyURLSearchParams;
  // The ID of the product to fetch data for, can be null if not provided in URL
  productId: string | null;
  // State setter for controlling the loading indicator visibility
  setDataLoading: Dispatch<SetStateAction<boolean>>;
  // State setter for storing any error messages that occur during data fetching
  setError: Dispatch<SetStateAction<string>>;
  // State setter for storing the company ID once determined (from URL or localStorage)
  setCompanyId: Dispatch<SetStateAction<string | null>>;
  // State setter for storing the emission trace hierarchy data structure
  setEmissions: Dispatch<SetStateAction<EmissionTrace | null>>;
  // State setter for storing detailed product information
  setProduct: Dispatch<SetStateAction<Product | null>>;
  // State setter for storing the product's audit log history
  setLogItems: Dispatch<SetStateAction<LogItem[]>>;
}

// Helper function to validate authentication token
// Returns early validation result to prevent unnecessary API calls
const validateAuthentication = (setError: Dispatch<SetStateAction<string>>, setDataLoading: Dispatch<SetStateAction<boolean>>) => {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    setError("No authentication token found");
    setDataLoading(false);
    return false;
  }
  
  return true;
};

// Helper function to determine company ID from URL parameters or localStorage
// Prioritizes URL parameters over stored values for better user experience
const determineCompanyId = (searchParams: ReadonlyURLSearchParams) => {
  // Try to get company ID from URL parameters first (priority source)
  let companyId = searchParams.get("cid");
  
  // Fall back to stored company ID if not provided in URL
  // This maintains user context across page navigations
  if (!companyId) {
    companyId = localStorage.getItem("selected_company_id");
  }
  
  return companyId;
};

// Helper function to fetch emission trace data with error handling
// Handles API call and state updates for emission trace information
const fetchEmissionTraces = async (
  companyId: string,
  productId: string,
  setEmissions: Dispatch<SetStateAction<EmissionTrace | null>>,
  setError: Dispatch<SetStateAction<string>>
) => {
  try {
    // Call the API to fetch emission trace data
    const emissionData = await productApi.getProductEmissionTrace(companyId, productId);
    // Update state with the fetched data
    setEmissions(emissionData);
  } catch (err) {
    // Log detailed error for debugging purposes
    console.error("Error fetching emission traces:", err);
    // Set user-friendly error message
    setError("Failed to load emission traces");
  }
};

// Helper function to fetch product data with error handling
// Handles API call and state updates for detailed product information
const fetchProductData = async (
  companyId: string,
  productId: string,
  setProduct: Dispatch<SetStateAction<Product | null>>,
  setError: Dispatch<SetStateAction<string>>
) => {
  try {
    // Call the API to fetch product details
    const productData = await productApi.getProduct(companyId, productId);
    // Update state with the fetched product data
    setProduct(productData);
  } catch (err) {
    // Log detailed error for debugging purposes
    console.error("Error fetching product data:", err);
    // Set user-friendly error message
    setError("Failed to fetch product data");
  }
};

// Helper function to fetch audit log data with error handling
// Handles API call and state updates for product audit history
// Note: Audit logs are non-critical, so errors don't affect overall page functionality
const fetchAuditLogs = async (
  companyId: string,
  productId: string,
  setLogItems: Dispatch<SetStateAction<LogItem[]>>
) => {
  try {
    // Call the API to fetch audit log entries
    // Note: parseInt is used because the audit log API requires numeric IDs
    const auditLogItems = await auditLogApi.getProductAuditLogs(
      parseInt(companyId),
      parseInt(productId)
    );
    // Update state with the fetched audit log items
    setLogItems(auditLogItems);
  } catch (err) {
    // Log error but don't set error state - audit logs are non-critical
    // This allows the page to still function even if audit logs fail to load
    console.error("Error fetching audit logs:", err);
  }
};

// Helper function to handle global errors with type safety
// Provides consistent error handling across the application
const handleGlobalError = (err: unknown, setError: Dispatch<SetStateAction<string>>) => {
  if (err instanceof Error) {
    // Use the error's message if it's a standard Error object
    setError(err.message);
  } else {
    // Fallback for non-standard errors
    setError("Something went wrong");
  }
};

// Main data fetching function that coordinates all API calls needed for the emissions tree page
// This function handles authentication verification, error handling, and parallel data fetching
export const fetchEmissionsTreeData = async ({
  searchParams,
  productId,
  setDataLoading,
  setError,
  setCompanyId,
  setEmissions,
  setProduct,
  setLogItems
}: FetchEmissionsTreeDataParams): Promise<void> => {
  try {
    // Activate loading state to show users that data is being fetched
    setDataLoading(true);
    
    // Validate authentication before proceeding with API calls
    if (!validateAuthentication(setError, setDataLoading)) {
      return;
    }

    // Determine the company ID from URL parameters or localStorage
    const companyId = determineCompanyId(searchParams);
    
    // Update component state with the determined company ID
    setCompanyId(companyId);

    // Only proceed with data fetching if we have both company and product IDs
    if (companyId && productId) {
      // Fetch emission traces for the product
      await fetchEmissionTraces(companyId, productId, setEmissions, setError);
      
      // Fetch detailed product data including metadata and emission totals
      await fetchProductData(companyId, productId, setProduct, setError);
      
      // Fetch audit log items for tracking product changes
      await fetchAuditLogs(companyId, productId, setLogItems);
    }
  } catch (err: unknown) {
    // Global error handler for any uncaught exceptions
    handleGlobalError(err, setError);
  } finally {
    // Always turn off loading state, regardless of success or failure
    // This ensures the UI doesn't get stuck in a loading state
    setDataLoading(false);
  }
};