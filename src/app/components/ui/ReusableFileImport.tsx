<<<<<<< HEAD
/**
 * ReusableFileImport component provides file upload functionality for multiple formats.
 * Supports JSON, CSV, XLSX, and AASX files with validation and error handling.
 * Used throughout the application for importing product data and other structured content.
 */

=======
// Client-side component directive for Next.js App Router
// Required for components using browser APIs like localStorage and file handling
>>>>>>> main
"use client";

// React hooks for state management and DOM references
// useRef: Provides direct access to file input element for programmatic triggering
// useState: Manages file selection state and error handling
import { useRef, useState } from "react";
// Custom button component with accessibility features and consistent styling
import Button from "./Button";

<<<<<<< HEAD
// Props interface for ReusableFileImport component
type Props = {
  onSuccess?: (redirectPath: string) => void; // Callback with redirect path on successful upload
  allowedExtensions?: string[]; // Array of allowed file extensions
  acceptedFormatsLabel?: string; // Label describing accepted formats
};

/**
 * ReusableFileImport component for handling multiple file format uploads
 * @param onSuccess - Callback function called with redirect path on successful import
 * @param allowedExtensions - Array of allowed file extensions (default: json, csv, xlsx, aasx)
 * @param acceptedFormatsLabel - Descriptive text about supported formats
 * @returns File import interface with upload button, validation, and progress feedback
 */
export default function ReusableFileImport({
  onSuccess,
  allowedExtensions = ["json", "csv", "xlsx", "aasx"], // Default supported formats
  acceptedFormatsLabel = "Supported formats: JSON, CSV, XLSX, AASX",
}: Props) {
  // State management for file upload process
=======
// Props interface for reusable file import component
// Supports multiple file formats and customizable success handling
type Props = {
  // Optional callback function triggered after successful file upload
  // Receives redirect path for navigation after import completion
  onSuccess?: (redirectPath: string) => void;
  // Array of allowed file extensions for validation
  // Defaults to common product import formats
  allowedExtensions?: string[];
  // User-friendly label describing accepted file formats
  // Displayed to guide users on valid file types
  acceptedFormatsLabel?: string;
};

// Reusable file import component for product data upload functionality
// Supports multiple file formats with format-specific API endpoint routing
// Features file validation, error handling, and progress feedback
// Implements multi-tenant company context with secure authentication
export default function ReusableFileImport({
  onSuccess,
  // Default extensions cover common product import formats
  // JSON/AASX for AAS (Asset Administration Shell) data
  // CSV/XLSX for tabular emissions data
  allowedExtensions = ["json", "csv", "xlsx", "aasx"],
  // Default label provides clear guidance on supported formats
  acceptedFormatsLabel = "Supported formats: JSON, CSV, XLSX, AASX",
}: Props) {
  // Selected file state for tracking user's file choice
  // Null when no file selected, File object when valid file chosen
>>>>>>> main
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Error state for displaying validation and upload failures
  // Provides user feedback for invalid files or upload issues
  const [fileError, setFileError] = useState<string | null>(null);
  
  // DOM reference to hidden file input element
  // Enables custom styled upload button while using native file picker
  const fileInputRef = useRef<HTMLInputElement>(null);

<<<<<<< HEAD
  /**
   * Handles file selection and validates file extension
   * @param e - File input change event
   */
=======
  // File selection change handler with validation logic
  // Validates file extension against allowed formats list
  // Updates state based on validation results
>>>>>>> main
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = file.name;
<<<<<<< HEAD
      // Extract file extension from filename
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      // Validate file extension against allowed types
=======
      // Extract file extension for validation
      // Converts to lowercase for case-insensitive comparison
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      // Validate file extension against allowed formats
>>>>>>> main
      if (allowedExtensions.includes(fileExtension || "")) {
        // Valid file: update state and clear any previous errors
        setSelectedFile(file);
        setFileError(null); // Clear any previous errors
      } else {
        // Invalid file: clear selection and show error message
        setSelectedFile(null);
        setFileError(`Invalid file format: .${fileExtension}. Please upload a valid file.`);
      }
    }
  };

<<<<<<< HEAD
  /**
   * Triggers the hidden file input element
   */
=======
  // Upload button click handler for triggering file selection
  // Programmatically opens native file picker dialog
  // Provides better UX than default file input styling
>>>>>>> main
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

<<<<<<< HEAD
  /**
   * Handles file submission to backend API
   */
=======
  // Async submit handler for file upload with format-specific routing
  // Implements multi-tenant authentication and error handling
  // Routes to different endpoints based on file format
>>>>>>> main
  const handleSubmit = async () => {
    // Early return if no file selected
    if (!selectedFile) return;

<<<<<<< HEAD
    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("file", selectedFile);

    // Get required authentication and company information
=======
    // Prepare FormData for multipart file upload
    const formData = new FormData();
    formData.append("file", selectedFile);

    // Retrieve authentication and company context from localStorage
    // Required for multi-tenant API access and security
>>>>>>> main
    const companyId = localStorage.getItem("selected_company_id");
    const token = localStorage.getItem("access_token");
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

<<<<<<< HEAD
    // Validate required data
=======
    // Validate required authentication data
>>>>>>> main
    if (!companyId || !token) {
      setFileError("Missing company or token.");
      return;
    }

<<<<<<< HEAD
    // Define API endpoints and redirect paths based on file type
=======
    // Initialize endpoint and redirect path variables
>>>>>>> main
    let endpoint = "";
    let redirectPath = "";

    // Format-specific endpoint and redirect path determination
    // Different file formats use different import APIs and result pages
    switch (fileExtension) {
      case "aasx":
        // AASX files: Asset Administration Shell XML format
        endpoint = `/companies/${companyId}/products/import/aas_aasx/`;
        redirectPath = "/product-list/product";
        break;
      case "json":
        // JSON files: Asset Administration Shell JSON format
        endpoint = `/companies/${companyId}/products/import/aas_json/`;
        redirectPath = "/product-list/product";
        break;
      case "csv":
      case "xlsx":
        // Tabular files: Emissions data import
        endpoint = `/companies/${companyId}/products/import/tabular/`;
        redirectPath = "/product-list/emissions-tree";
        break;
      default:
        // Unsupported format fallback
        setFileError("Unsupported file format.");
        return;
    }

    try {
<<<<<<< HEAD
      // Submit file to backend API
=======
      // Execute POST request with file data and authentication
>>>>>>> main
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

<<<<<<< HEAD
      // Handle file size limit errors
=======
      // Handle file size limit error (413 Payload Too Large)
>>>>>>> main
      if (res.status === 413) {
        setFileError("File too large. Must be under 25MB.");
        return;
      }

<<<<<<< HEAD
      // Handle general upload errors
=======
      // Handle general API errors
>>>>>>> main
      if (!res.ok) {
        const err = await res.json();
        setFileError(err?.detail || "Upload failed.");
        return;
      }

<<<<<<< HEAD
      // Handle successful uploads with special logic for AASX files
=======
      // Handle successful upload with format-specific response processing
>>>>>>> main
      if (fileExtension === "aasx") {
        // AASX files return product ID for direct navigation
        const data = await res.json();
        const productId = data?.product_id;
        if (productId) {
          // Navigate directly to product emissions tree with ID
          onSuccess?.(`/product-list/emissions-tree?id=${productId}&cid=${companyId}`);
        } else {
          // Handle missing product ID in response
          setFileError("Upload succeeded, but product ID is missing.");
        }
      } else {
        // Other formats use standard redirect path
        onSuccess?.(redirectPath);
      }
    } catch (error) {
      // Handle unexpected errors (network issues, etc.)
      console.error(error);
      setFileError("Unexpected error occurred.");
    }
  };

  return (
    <>
      {/* Hidden file input element */}
      <input
        type="file"
        accept={allowedExtensions.map(ext => `.${ext}`).join(", ")}
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {/* Main import interface */}
      <div className="flex justify-between">
        <div className="flex flex-col items-start">
          {/* Upload trigger button */}
          <Button onClick={handleUploadClick}>Upload</Button>

          {/* Selected file display */}
          {selectedFile && (
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              Selected file: {selectedFile.name}
            </p>
          )}

          {/* Error message display */}
          {fileError && <p className="mt-4 text-sm text-red-600 dark:text-red-500">{fileError}</p>}

          {/* Format information */}
          <p className="mt-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
            {acceptedFormatsLabel}
          </p>
        </div>

        <div className="flex flex-col items-end">
          {/* Submit button */}
          <Button
            onClick={selectedFile ? handleSubmit : undefined}
            disabled={!selectedFile}
            className={!selectedFile ? "opacity-50 cursor-not-allowed" : ""}
          >
            Go to results
          </Button>
          
          {/* Validation message */}
          {!selectedFile && (
            <p className="mt-2 text-xs text-amber-500">Please upload a valid file first</p>
          )}
        </div>
      </div>
    </>
  );
}
