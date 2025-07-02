/**
 * ReusableFileImport component provides file upload functionality for multiple formats.
 * Supports JSON, CSV, XLSX, and AASX files with validation and error handling.
 * Used throughout the application for importing product data and other structured content.
 */

"use client";

import { useRef, useState } from "react";
import Button from "./Button";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection and validates file extension
   * @param e - File input change event
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = file.name;
      // Extract file extension from filename
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      // Validate file extension against allowed types
      if (allowedExtensions.includes(fileExtension || "")) {
        setSelectedFile(file);
        setFileError(null); // Clear any previous errors
      } else {
        setSelectedFile(null);
        setFileError(`Invalid file format: .${fileExtension}. Please upload a valid file.`);
      }
    }
  };

  /**
   * Triggers the hidden file input element
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles file submission to backend API
   */
  const handleSubmit = async () => {
    if (!selectedFile) return;

    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("file", selectedFile);

    // Get required authentication and company information
    const companyId = localStorage.getItem("selected_company_id");
    const token = localStorage.getItem("access_token");
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    // Validate required data
    if (!companyId || !token) {
      setFileError("Missing company or token.");
      return;
    }

    // Define API endpoints and redirect paths based on file type
    let endpoint = "";
    let redirectPath = "";

    switch (fileExtension) {
      case "aasx":
        endpoint = `/companies/${companyId}/products/import/aas_aasx/`;
        redirectPath = "/product-list/product";
        break;
      case "json":
        endpoint = `/companies/${companyId}/products/import/aas_json/`;
        redirectPath = "/product-list/product";
        break;
      case "csv":
      case "xlsx":
        endpoint = `/companies/${companyId}/products/import/tabular/`;
        redirectPath = "/product-list/emissions-tree";
        break;
      default:
        setFileError("Unsupported file format.");
        return;
    }

    try {
      // Submit file to backend API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // Handle file size limit errors
      if (res.status === 413) {
        setFileError("File too large. Must be under 25MB.");
        return;
      }

      // Handle general upload errors
      if (!res.ok) {
        const err = await res.json();
        setFileError(err?.detail || "Upload failed.");
        return;
      }

      // Handle successful uploads with special logic for AASX files
      if (fileExtension === "aasx") {
        const data = await res.json();
        const productId = data?.product_id;
        if (productId) {
          onSuccess?.(`/product-list/emissions-tree?id=${productId}&cid=${companyId}`);
        } else {
          setFileError("Upload succeeded, but product ID is missing.");
        }
      } else {
        onSuccess?.(redirectPath);
      }
    } catch (error) {
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
