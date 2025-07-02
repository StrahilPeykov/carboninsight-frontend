// This file provides utilities for exporting product data in various formats
// It handles both backend API exports and frontend-generated PDF reports

import { apiRequest } from "@/lib/api/apiClient";
import { Product } from "@/lib/api/productApi";
import { generatePDFReportHTML } from "@/utils/generatePdfUtil";

// Export formats supported by the application
// Each format has a specific purpose and is handled differently
export type ExportFormat =
  | "pdf" // Carbon Footprint Report report (frontend generated)
  | "aasx" // AAS package (primary Carbon Footprint Report format)
  | "aas_xml" // AAS XML format
  | "aas_json" // AAS JSON format
  | "scsn_pcf_xml" // SCSN PCF XML (partial)
  | "scsn_full_xml" // SCSN full XML (complete)
  | "csv" // CSV export for spreadsheet import
  | "xlsx" // Excel export
  | "zip"; // ZIP export


// Utility function to trigger file download in the browser
// Creates a temporary URL for the blob and simulates a click on a download link
// Takes a blob (file data), filename to save as, and MIME type of the file
function downloadFile(blob: Blob, filename: string, mimeType: string) {
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Clean up the URL object to prevent memory leaks
  window.URL.revokeObjectURL(url);
}

// Main export function that calls appropriate backend endpoints based on the requested format
// All formats except PDF are handled here (PDF is generated on frontend)
// Takes company ID, product ID, export format to use, and product name for the filename
// May throw errors if authentication token is missing or export fails
export async function exportProduct(
  companyId: string,
  productId: string,
  format: Exclude<ExportFormat, "pdf">,
  productName: string = "product"
): Promise<void> {
  // Check for authentication token
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No authentication token available");
  }

  // Map frontend format names to actual backend endpoint paths
  // Note: CSV and XLSX are company-level exports, others are product-level
  const formatEndpoints = {
    aasx: `products/${productId}/export/aas_aasx`,
    aas_xml: `products/${productId}/export/aas_xml`,
    aas_json: `products/${productId}/export/aas_json`,
    scsn_pcf_xml: `products/${productId}/export/scsn_pcf_xml`,
    scsn_full_xml: `products/${productId}/export/scsn_full_xml`,
    zip: `products/${productId}/export/zip`,
    csv: "products/export/csv", // Company-level export
    xlsx: "products/export/xlsx", // Company-level export
  };

  // Define MIME types for each export format
  // These are used in the download to set the correct content type
  const mimeTypes = {
    aasx: "application/asset-administration-shell-package",
    aas_xml: "application/xml",
    aas_json: "application/json",
    scsn_pcf_xml: "application/xml",
    scsn_full_xml: "application/xml",
    zip: "application/zip",
    csv: "text/csv",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  // Define file extensions for each export format
  // Used to set the correct extension in the downloaded filename
  const fileExtensions = {
    aasx: "aasx",
    aas_xml: "xml",
    aas_json: "json",
    scsn_pcf_xml: "xml",
    scsn_full_xml: "xml",
    zip: "zip",
    csv: "csv",
    xlsx: "xlsx",
  };

  try {
    // Construct the API endpoint based on format
    const endpoint = `/companies/${companyId}/${formatEndpoints[format]}/`;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle unsuccessful responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Export failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    // Get the file content as a blob
    const blob = await response.blob();
    // Clean product name to use in filename (remove special characters)
    const cleanProductName = productName.replace(/[^a-zA-Z0-9]/g, "_");
    const formatSuffix = format.replace("_", "_");

    // Generate an appropriate filename based on the export type
    // Company-level exports use a different naming convention
    let filename: string;
    if (format === "csv" || format === "xlsx") {
      filename = `company_products_${formatSuffix}_${new Date().toISOString().split("T")[0]}.${fileExtensions[format]}`;
    } else {
      filename = `${cleanProductName}_${formatSuffix}_${new Date().toISOString().split("T")[0]}.${fileExtensions[format]}`;
    }

    // Trigger the file download
    downloadFile(blob, filename, mimeTypes[format]);
  } catch (error) {
    // Log and re-throw errors with more context
    console.error(`Export failed for format ${format}:`, error);
    throw new Error(
      `Failed to export ${format}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Generate and download a comprehensive PDF report using emission traces
// Calls backend API to get emission traces and generates a clean PDF
// Takes company ID and the product object containing all product data
// May throw errors if API request fails or if popup is blocked
export async function exportProductPDFReport(companyId: string, product: Product): Promise<void> {
  try {
    // Fetch emission traces from backend
    // This data contains the hierarchical structure of emissions for the product
    const emissionTrace = await apiRequest<any>(
      `/companies/${companyId}/products/${product.id}/emission_traces/`
    );

    // Generate HTML report using the utility function from generatePdfUtil.ts
    const reportHtml = generatePDFReportHTML(product, emissionTrace);

    // Open the report in a new window so user can print/save as PDF
    // This is the standard approach for generating PDFs from HTML in the browser
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Popup blocked. Please allow popups and try again.");
    }

    // Write the HTML content to the new window
    printWindow.document.write(reportHtml);
    printWindow.document.close();

    // Auto-trigger print dialog after content loads
    // This provides a better user experience than requiring manual printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  } catch (error) {
    // Log and re-throw errors with more context
    console.error("PDF report generation failed:", error);
    throw new Error(
      "Failed to generate PDF report: " + (error instanceof Error ? error.message : "Unknown error")
    );
  }
}

// Provides metadata about available export formats
// Used in UI to display options to users with descriptive text
// Returns array of export format objects with value, label and description
export function getExportFormats(): Array<{
  value: ExportFormat;
  label: string;
  description: string;
}> {
  return [
    {
      value: "zip",
      label: "ZIP Export",
      description: "ZIP archive of all files of the product",
    },
    {
      value: "pdf",
      label: "PDF Report",
      description: "Complete Carbon Footprint Report (opens print dialog)",
    },
    {
      value: "aasx",
      label: "AASX Package",
      description: "Asset Administration Shell package (primary Carbon Footprint Report format)",
    },
    {
      value: "csv",
      label: "CSV Data",
      description: "All company products in comma-separated format",
    },
    {
      value: "xlsx",
      label: "Excel File",
      description: "All company products in Microsoft Excel format",
    },
    {
      value: "aas_xml",
      label: "AAS XML",
      description: "Asset Administration Shell XML format with Carbon Footprint data",
    },
    {
      value: "aas_json",
      label: "AAS JSON",
      description: "Asset Administration Shell JSON format",
    },
    {
      value: "scsn_pcf_xml",
      label: "SCSN PCF XML",
      description: "Smart Connected Supplier Network PCF data only (partial)",
    },
    {
      value: "scsn_full_xml",
      label: "SCSN Full XML",
      description: "Complete SCSN XML with placeholders for missing fields",
    },
  ];
}
