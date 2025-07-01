import { translateImportError } from "@/utils/translateImportError";
import { productApi } from "@/lib/api/productApi";

// Handles AI product advice requests including state management
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // Verify token and company ID to prevent unauthorized API access
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const company =
    typeof window !== "undefined" ? localStorage.getItem("selected_company_id") : null;

  if (!API_URL || !token || !company) return;

  try {
    setAiModalStep("loading");
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

// Handles initiating the export workflow
export const handleProductExport = ({
  product,
  event,
  setSelectedProductForExport,
  setShowExportModal,
}: {
  product: any;
  event: React.MouseEvent;
  setSelectedProductForExport: (product: any) => void;
  setShowExportModal: (show: boolean) => void;
}) => {
  // Prevent event bubbling to parent elements (stops row click from triggering)
  event.stopPropagation();
  // Store the selected product in state for use by the export modal
  setSelectedProductForExport(product);
  // Show the export modal dialog by updating its visibility state
  setShowExportModal(true);
};

// Handles closing the export modal
export const closeExportModal = ({
  setShowExportModal,
  setSelectedProductForExport,
}: {
  setShowExportModal: (show: boolean) => void;
  setSelectedProductForExport: (product: any | null) => void;
}) => {
  // Hide the export modal by setting its visibility state to false
  setShowExportModal(false);
  // Clear the selected product data to prevent stale references and free memory
  setSelectedProductForExport(null);
};

// Sets up the AI advisor modal state
export const initiateAIAdvice = ({
  productId,
  productName,
  setPendingProductId,
  setPendingProductName,
  setAiModalStep,
}: {
  productId: string;
  productName: string;
  setPendingProductId: (id: string | null) => void;
  setPendingProductName: (name: string) => void;
  setAiModalStep: (step: "confirm" | "loading" | "result" | null) => void;
}) => {
  // Store the product ID for which AI advice is being requested
  setPendingProductId(productId);
  // Store the product name to display in the modal for better user context
  setPendingProductName(productName);
  // Set modal to confirmation step where user can review before proceeding with AI analysis
  setAiModalStep("confirm");
};

// Navigates to the product edit page
export const navigateToProductEdit = ({ id, router }: { id: string; router: any }) => {
  router.push(`/product-list/product?product_id=${id}`);
};

// Prepares the product deletion workflow
export const setupProductDeletion = ({
  product,
  setToDeleteProduct
}: {
  product: any;
  setToDeleteProduct: (product: any) => void;
}) => {
  setToDeleteProduct(product);
};

// Downloads a product import template in the specified format
export const handleTemplateDownload = async (
  format: "csv" | "xlsx",
  options: {
    apiBaseUrl?: string;
    setError?: (message: string) => void;
    liveRegionId?: string;
  } = {}
): Promise<void> => {
  const {
    liveRegionId = "status-announcements",
    setError,
  } = options;

  try {
    const companyId = localStorage.getItem("selected_company_id");
    
    if (!companyId) {
      const errorMsg = "Company ID not found.";
      if (setError) setError(errorMsg);
      return;
    }

    // Live region announcements provide real-time updates for screen reader users
    const liveRegion = document.getElementById(liveRegionId);
    if (liveRegion) {
      liveRegion.textContent = `Downloading ${format.toUpperCase()} template...`;
    }
    
    // Use the API wrapper instead of direct fetch
    const blob = await productApi.getExport(companyId, format, "true");
    
    // Create an object URL from the blob
    const objectUrl = URL.createObjectURL(blob);

    // Create a download link and trigger it
    const link = document.createElement("a");
    link.href = objectUrl;
    
    // Set filename (Content-Disposition header not accessible through API wrapper)
    const fileName = `product_template.${format}`;
    
    // Set up download link and trigger automatic download
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Clean up DOM elements and free memory resources
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);

    // Update accessibility announcement for screen reader users
    if (liveRegion) {
      liveRegion.textContent = `${format.toUpperCase()} template downloaded successfully`;
    }
  } catch (err) {
    console.error("Error downloading template:", err);
    const errorMsg = err instanceof Error ? err.message : "Failed to download template";
    if (setError) setError(errorMsg);
  }
};

// Fetches products with accessibility announcements and error handling
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
    const liveRegion = document.getElementById(statusRegionId);
    if (liveRegion) {
      liveRegion.textContent = "Loading products...";
    }

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
    if (liveRegion) {
      liveRegion.textContent = `${data.length} products loaded`;
    }

    // Return the data
    return data;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Something went wrong";

    // Update error state if callback provided
    if (onError) onError(errorMessage);

    // Announce error via ARIA live region
    const urgentRegion = document.getElementById(errorRegionId);
    if (urgentRegion) {
      urgentRegion.textContent = "Error loading products";
    }

    return [];
  } finally {
    if (onLoadingChange) onLoadingChange(false);
  }
};

// Handles file upload for product import with appropriate validation and error handling
export const handleFileUpload = async ({
  file,
  router,
  setImportNotice,
  setImportErrors,
  setError,
  setDataLoading,
  setProducts,
}: {
  file: File;
  type: "aasx" | "csv";
  router: any;
  setImportNotice: (notice: string | null) => void;
  setImportErrors: (errors: { attr: string; detail: string }[]) => void;
  setError: (error: string) => void;
  setDataLoading: (loading: boolean) => void;
  setProducts: (products: any[]) => void;
}) => {
  // Get authentication and company info from localStorage
  const token = localStorage.getItem("access_token");
  const companyId = localStorage.getItem("selected_company_id");
  if (!token || !companyId) return;

  // Validate file extension
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["aasx", "json", "xml", "csv", "xlsx"].includes(extension)) {
    alert("Unsupported file type.");
    return;
  }

  // Check file size (25MB limit)
  if (file.size > 25 * 1024 * 1024) {
    alert("File size exceeds 25MB limit.");
    return;
  }

  // Prepare form data for upload
  const formData = new FormData();
  formData.append("file", file);

  // Detect empty files to prevent unnecessary API calls
  if (["csv", "json", "xml", "aasx"].includes(extension)) {
    const rawText = await file.text();
    const cleaned = rawText.replace(/\s+/g, "");
    if (cleaned.length === 0) {
      setImportNotice("The uploaded file appears to be empty. Nothing was imported.");
      return;
    }

    // Special handling for CSV to check if it only contains a header row
    if (extension === "csv") {
      // Process CSV content by splitting into lines, trimming whitespace, and keeping non-empty lines
      const nonEmptyLines = rawText
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
      if (nonEmptyLines.length <= 1) {
        setImportNotice(
          "The uploaded file was empty or contained only headers. Nothing was imported."
        );
        return;
      }
    }
  } else if (extension === "xlsx") {
    // Basic size check for XLSX files
    if (file.size < 500) {
      setImportNotice("The uploaded XLSX file appears to be empty or invalid.");
      return;
    }
  }

  // Determine API endpoint based on file type
  let endpoint = "";
  let redirectPath = "";

  if (["aasx", "json", "xml"].includes(extension)) {
    // AAS-based formats
    if (extension === "aasx") {
      endpoint = `/companies/${companyId}/products/import/aas_aasx/`;
    } else if (extension === "json") {
      endpoint = `/companies/${companyId}/products/import/aas_json/`;
    } else if (extension === "xml") {
      endpoint = `/companies/${companyId}/products/import/aas_xml/`;
    }
    redirectPath = "/product-list/product";
  } else {
    // Tabular formats (CSV/XLSX)
    endpoint = `/companies/${companyId}/products/import/tabular/`;
    redirectPath = "/product-list/emissions-tree";
  }

  try {
    // Make API request to upload the file
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    // Handle error responses
    if (!res.ok) {
      const contentType = res.headers.get("Content-Type");

      if (contentType?.includes("application/json")) {
        // Handle JSON error responses with structured error data
        const err = await res.json().catch(() => null);

        if (err?.errors && Array.isArray(err.errors)) {
          const isValidationError = err.type === "validation_error";

          if (isValidationError) {
            setImportErrors(err.errors);
          } else {
            setError(err.detail || "Upload failed due to an unknown issue.");
          }
        } else {
          const fallbackMessage =
            typeof err?.detail === "string" && err.detail.trim().length > 0
              ? err.detail
              : "Unexpected error occurred while uploading.";
          setError(fallbackMessage);
        }
      } else {
        // Extract error message from HTML response for server errors
        const rawText = await res.text();
        // Extract error messages from HTML responses when JSON isn't available
        const titleMatch = rawText.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch?.[1] ?? "Unexpected server error";
        setError(`Import failed: ${title}`);
      }

      return;
    }

    // Handle successful imports
    if (["aasx", "json", "xml"].includes(extension)) {
      // Parse response and navigate to product view for AAS format files
      const data = await res.json();
      const productId = data?.id;
      if (productId) {
        // Redirect to emissions tree with product ID
        router.push(`/product-list/emissions-tree?id=${productId}&cid=${companyId}`);
      } else {
        alert("Missing product ID in response.");
      }
    } else {
      // Handle tabular format response (CSV/XLSX)
      const data = await res.json();

      if (Array.isArray(data) && data.length === 1 && data[0]?.id) {
        // Single product import - navigate directly to product view
        const productId = data[0].id;
        router.push(`/product-list/emissions-tree?id=${productId}&cid=${companyId}`);
      } else {
        // Bulk import - show success message and refresh product list
        const importedCount = Array.isArray(data) ? data.length : 0;

        // Generate user-friendly notification message
        const rawMsg = `Successfully imported ${importedCount} product(s). Any duplicates were skipped.`;
        const userFriendlyMsg = translateImportError(rawMsg);

        // Update UI state and refresh product list
        setImportNotice(userFriendlyMsg);
        setImportErrors([]);
        // For bulk imports, update the product list automatically to show new additions
        await fetchProducts({
          companyId,
          onLoadingChange: setDataLoading,
          onError: setError,
          setProducts,
          onAuthError: () => router.push("/login"),
        });
      }
    }
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Unexpected upload error.");
  }
};
