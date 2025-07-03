<<<<<<< HEAD
/**
 * ImportErrorCard component displays detailed error information for failed import operations.
 * Shows row-specific errors, field-level validation issues, and human-readable error translations.
 * Used during CSV/XLSX import processes to help users identify and fix data problems.
 */

=======
// Client-side component directive for Next.js App Router
// Required for components that use browser-specific APIs or React hooks
>>>>>>> main
"use client";

// React core import for component functionality
// Used for creating functional component with JSX syntax
import React from "react";
// Custom card component providing consistent layout and styling
// Wraps error content with semantic HTML and accessibility features
import Card from "./Card";
// Utility function for translating backend error messages to user-friendly text
// Converts technical API error codes and messages into readable explanations
import { translateImportError } from "@/utils/translateImportError";

<<<<<<< HEAD
// Type definition for individual error items
type ErrorItem = {
  attr: string; // Field or attribute name where error occurred
  detail: string; // Raw error message from backend
};

// Props interface for ImportErrorCard component
type Props = {
  row: string; // Row number or identifier where error occurred
  errors: ErrorItem[]; // Array of error details for this row
};

/**
 * ImportErrorCard component for displaying import validation errors
 * @param row - The row number or identifier where the error occurred
 * @param errors - Array of error objects containing field names and error details
 * @returns Card component displaying formatted error information with field-specific details
 */
export default function ImportErrorCard({ row, errors }: Props) {
  // Extract general error summary (usually has .error suffix)
  const summary = errors.find(e => e.attr.endsWith(".error"))?.detail;
  
  // Get field-specific errors (excluding general error)
=======
// Type definition for individual error items from backend validation
// Represents field-specific errors with attribute path and error description
// Used for parsing and displaying structured error information from API responses
type ErrorItem = {
  attr: string;    // Dot-notation path to the field that caused the error (e.g., "1.row.name")
  detail: string;  // Human-readable error message or error code from backend validation
};

// Props interface for ImportErrorCard component
// Designed for displaying row-specific import validation errors
// Supports multiple error types and field-level error reporting
type Props = {
  row: string;          // Row identifier or number from the imported data file
  errors: ErrorItem[];  // Array of validation errors for this specific row
};

// Import error card component for displaying row-specific validation failures
// Provides user-friendly error reporting for data import processes
// Separates general row errors from specific field validation issues
// Uses semantic styling to clearly indicate error severity and context
export default function ImportErrorCard({ row, errors }: Props) {
  // Extract general row-level error summary from error collection
  // Looks for errors with ".error" suffix which typically represent overall row issues
  // Provides high-level context for what went wrong with the entire row
  const summary = errors.find(e => e.attr.endsWith(".error"))?.detail;
  
  // Filter field-specific errors by excluding general row errors
  // Creates array of individual field validation failures for detailed reporting
  // Enables granular error display for each problematic field in the row
>>>>>>> main
  const fieldErrors = errors.filter(e => !e.attr.endsWith(".error"));

  return (
    <Card className="p-4 bg-red-50 border-l-4 border-red-500 text-sm text-gray-900">
      {/* Error header with row information */}
      <p className="font-bold text-red-800 mb-1">⚠️ Import Error in Row {row}</p>
      
      {/* Main error message with human-readable translation */}
      <p className="text-gray-800 mb-2">
        {translateImportError(summary || fieldErrors[0]?.detail)}
      </p>

      {/* Detailed field-level errors if available */}
      {fieldErrors.length > 0 && (
        <div className="bg-white border rounded p-3 text-sm text-gray-700">
          <p className="font-semibold mb-1">Affected Fields:</p>
          {/* Grid layout for field errors with responsive columns */}
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs">
            {fieldErrors.map((e, i) => {
              // Clean up field name by removing row prefix
              const field = e.attr.replace(/^\d+\.row\./, "");
              return (
                <li key={i}>
                  <strong>{field}</strong>: {translateImportError(e.detail, field)}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
