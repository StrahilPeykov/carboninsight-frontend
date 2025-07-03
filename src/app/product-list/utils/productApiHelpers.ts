import { productApi } from "@/lib/api/productApi";
import { validateEnvironment, updateLiveRegion, triggerFileDownload } from "./environmentUtils";

// Handles AI product advice requests including state management
// Processes user prompts and manages AI modal workflow states
// Integrates with the product API to request AI-generated emission reduction advice
export const handleRequestProductAdvice = async ({
  productId,
  prompt,
  productName,
  setAiModalStep,
  setAiAdvice,
  setPendingProductName,
}: {
  productId: string;
  prompt: string;
  productName: string;
  setAiModalStep: (step: "confirm" | "loading" | "result" | null) => void;
  setAiAdvice: (advice: string | null) => void;
  setPendingProductName: (name: string) => void;
}) => {
  const { isValid } = validateEnvironment();
  if (!isValid) return;

  try {
    setAiModalStep("loading");
    const company = localStorage.getItem("selected_company_id")!;
    const data = await productApi.requestProductAdvice(company, productId, prompt);

    setAiAdvice(data.response);
    setPendingProductName(productName ?? "this product");
    setAiModalStep("result");
  } catch (err) {
    console.error("Failed to request AI advice", err);
    setAiModalStep(null);
    setAiAdvice(null);
  }
};

// Downloads a product import template in the specified format
// Handles template generation and download with accessibility announcements
// Supports both CSV and XLSX formats for product data import
export const handleTemplateDownload = async (
  format: "csv" | "xlsx",
  options: {
    apiBaseUrl?: string;
    setError?: (message: string) => void;
    liveRegionId?: string;
  } = {}
): Promise<void> => {
  const { liveRegionId = "status-announcements", setError } = options;

  try {
    const companyId = localStorage.getItem("selected_company_id");
    
    if (!companyId) {
      const errorMsg = "Company ID not found.";
      if (setError) setError(errorMsg);
      return;
    }

    // Live region announcements provide real-time updates for screen reader users
    updateLiveRegion(liveRegionId, `Downloading ${format.toUpperCase()} template...`);
    
    // Use the API wrapper instead of direct fetch
    const blob = await productApi.getExport(companyId, format, "true");
    
    // Set filename (Content-Disposition header not accessible through API wrapper)
    const fileName = `product_template.${format}`;
    
    // Set up download link and trigger automatic download
    triggerFileDownload(blob, fileName);

    // Update accessibility announcement for screen reader users
    updateLiveRegion(liveRegionId, `${format.toUpperCase()} template downloaded successfully`);
  } catch (err) {
    console.error("Error downloading template:", err);
    const errorMsg = err instanceof Error ? err.message : "Failed to download template";
    if (setError) setError(errorMsg);
  }
};

// Fetches products with accessibility announcements and error handling
// Handles product search and loading with comprehensive error management
// Provides accessibility support through live region announcements
export const fetchProducts = async (options: {
  companyId?: string | null;
  query?: string;
  apiBaseUrl?: string;
  onLoadingChange?: (isLoading: boolean) => void;
  onError?: (message: string) => void;
  setProducts?: (products: any[]) => void;
  onAuthError?: () => void;
  statusRegionId?: string;
  errorRegionId?: string;
}): Promise<any[]> => {
  const {
    companyId = localStorage.getItem("selected_company_id"),
    query = "",
    onLoadingChange,
    onError,
    setProducts,
    onAuthError,
    statusRegionId = "status-announcements",
    errorRegionId = "error-announcements",
  } = options;

  if (!companyId) {
    if (onError) onError("Company ID not found");
    return [];
  }

  try {
    if (onLoadingChange) onLoadingChange(true);

    // Announce loading status
    updateLiveRegion(statusRegionId, "Loading products...");

    // Get auth token
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      if (onAuthError) onAuthError();
      return [];
    }

    // Build the API URL with search parameter
    const searchParam = query.length >= 4 ? `?search=${encodeURIComponent(query)}` : "";
    // Parse response
    const data = await productApi.searchProducts(companyId, searchParam);

    // Update state if callback provided
    if (setProducts) setProducts(data);

    // Announce completion
    updateLiveRegion(statusRegionId, `${data.length} products loaded`);

    // Return the data
    return data;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Something went wrong";

    // Update error state if callback provided
    if (onError) onError(errorMessage);

    // Announce error via ARIA live region
    updateLiveRegion(errorRegionId, "Error loading products");

    return [];
  } finally {
    if (onLoadingChange) onLoadingChange(false);
  }
};
