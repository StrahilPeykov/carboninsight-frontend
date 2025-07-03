// Import utility for translating server error messages into user-friendly text
import { translateImportError } from "@/utils/translateImportError";

// Helper function to determine API endpoint and redirect path
// Maps file extensions to appropriate import endpoints and navigation targets
// Handles both AAS-based and tabular import formats
export const getUploadConfig = (extension: string, companyId: string) => {
  // Check if the file is an AAS-based format (Asset Administration Shell)
  if (["aasx", "json", "xml"].includes(extension)) {
    // Define specific endpoints for each AAS format type
    const endpoints: Record<string, string> = {
      aasx: `/companies/${companyId}/products/import/aas_aasx/`,
      json: `/companies/${companyId}/products/import/aas_json/`,
      xml: `/companies/${companyId}/products/import/aas_xml/`,
    };
    // Return AAS-specific configuration with product detail redirect
    return {
      endpoint: endpoints[extension],
      redirectPath: "/product-list/product"
    };
  }
  
  // Handle tabular formats (CSV/XLSX) with emissions tree redirect
  return {
    endpoint: `/companies/${companyId}/products/import/tabular/`,
    redirectPath: "/product-list/emissions-tree"
  };
};

// Helper function to handle upload response errors
// Processes different error response formats and sets appropriate error states
// Handles both JSON and HTML error responses from the server
export const handleUploadError = async (
  res: Response,
  setError: (error: string) => void,
  setImportErrors: (errors: { attr: string; detail: string }[]) => void
) => {
  // Extract content type to determine how to parse the error response
  const contentType = res.headers.get("Content-Type");

  // Handle structured JSON error responses from the API
  if (contentType?.includes("application/json")) {
    // Safely parse JSON response, fallback to null if parsing fails
    const err = await res.json().catch(() => null);

    // Check if response contains structured validation errors
    if (err?.errors && Array.isArray(err.errors)) {
      // Determine if this is a validation error or general error
      const isValidationError = err.type === "validation_error";
      if (isValidationError) {
        // Set detailed validation errors for field-specific feedback
        setImportErrors(err.errors);
      } else {
        // Set general error message for non-validation issues
        setError(err.detail || "Upload failed due to an unknown issue.");
      }
    } else {
      // Handle cases where JSON doesn't contain expected error structure
      const fallbackMessage =
        typeof err?.detail === "string" && err.detail.trim().length > 0
          ? err.detail
          : "Unexpected error occurred while uploading.";
      setError(fallbackMessage);
    }
  } else {
    // Handle HTML error responses (typically from server errors or proxy issues)
    const rawText = await res.text();
    // Extract error title from HTML response for user-friendly display
    const titleMatch = rawText.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch?.[1] ?? "Unexpected server error";
    setError(`Import failed: ${title}`);
  }
};

// Helper function to handle successful upload response
// Processes successful upload responses and manages navigation and state updates
// Handles both single product and bulk import scenarios
export const handleUploadSuccess = async (
  res: Response,
  extension: string,
  router: any,
  companyId: string,
  setImportNotice: (notice: string | null) => void,
  setImportErrors: (errors: { attr: string; detail: string }[]) => void,
  setDataLoading: (loading: boolean) => void,
  setError: (error: string) => void,
  setProducts: (products: any[]) => void
) => {
  // Handle AAS-based file imports (single product workflow)
  if (["aasx", "json", "xml"].includes(extension)) {
    // Parse response to extract product information
    const data = await res.json();
    const productId = data?.id;
    if (productId) {
      // Navigate directly to emissions tree view for the imported product
      router.push(`/product-list/emissions-tree?id=${productId}&cid=${companyId}`);
    } else {
      // Handle unexpected response structure
      alert("Missing product ID in response.");
    }
  } else {
    // Handle tabular file imports (potentially multiple products)
    const data = await res.json();

    // Check if this is a single product import
    if (Array.isArray(data) && data.length === 1 && data[0]?.id) {
      // Navigate directly to the single imported product
      const productId = data[0].id;
      router.push(`/product-list/emissions-tree?id=${productId}&cid=${companyId}`);
    } else {
      // Handle bulk import scenario with multiple products
      const importedCount = Array.isArray(data) ? data.length : 0;
      // Generate user-friendly success message
      const rawMsg = `Successfully imported ${importedCount} product(s). Any duplicates were skipped.`;
      const userFriendlyMsg = translateImportError(rawMsg);

      // Update UI state to show import success
      setImportNotice(userFriendlyMsg);
      setImportErrors([]);
      
      // Import fetchProducts dynamically to avoid circular dependency
      // This refreshes the product list to show newly imported items
      const { fetchProducts } = await import("./productApiHelpers");
      await fetchProducts({
        companyId,
        onLoadingChange: setDataLoading,
        onError: setError,
        setProducts,
        onAuthError: () => router.push("/login"),
      });
    }
  }
};

// Handles file upload for product import with appropriate validation and error handling
// Main entry point for file upload workflow with comprehensive validation and processing
// Integrates all upload-related utilities and manages the complete upload lifecycle
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
  // Import validation utilities at runtime to avoid circular dependencies
  // This pattern prevents module resolution issues during build time
  const { validateFileType, checkFileEmpty } = await import("./fileValidationUtils");
  
  // Get authentication and company info from localStorage
  // These are required for API authorization and proper data scoping
  const token = localStorage.getItem("access_token");
  const companyId = localStorage.getItem("selected_company_id");
  if (!token || !companyId) return;

  // Validate file extension against supported formats
  const extension = validateFileType(file.name);
  if (!extension) {
    alert("Unsupported file type.");
    return;
  }

  // Check file size (25MB limit to prevent server overload)
  if (file.size > 25 * 1024 * 1024) {
    alert("File size exceeds 25MB limit.");
    return;
  }

  // Check if file is empty to avoid unnecessary processing
  const isEmpty = await checkFileEmpty(file, extension);
  if (isEmpty) {
    // Provide specific feedback based on file type
    const message = extension === "csv" 
      ? "The uploaded file was empty or contained only headers. Nothing was imported."
      : "The uploaded file appears to be empty. Nothing was imported.";
    setImportNotice(message);
    return;
  }

  // Prepare form data for upload with the file attached
  const formData = new FormData();
  formData.append("file", file);

  // Get upload configuration based on file type and company context
  const { endpoint } = getUploadConfig(extension, companyId);

  try {
    // Make API request to upload the file to the appropriate endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    // Handle error responses with appropriate user feedback
    if (!res.ok) {
      await handleUploadError(res, setError, setImportErrors);
      return;
    }

    // Handle successful imports with navigation and state updates
    await handleUploadSuccess(
      res,
      extension,
      router,
      companyId,
      setImportNotice,
      setImportErrors,
      setDataLoading,
      setError,
      setProducts
    );
  } catch (err) {
    // Handle unexpected network or runtime errors
    console.error("Upload failed:", err);
    alert("Unexpected upload error.");
  }
};
