/**
 * ImportErrorCard component displays detailed error information for failed import operations.
 * Shows row-specific errors, field-level validation issues, and human-readable error translations.
 * Used during CSV/XLSX import processes to help users identify and fix data problems.
 */

"use client";

import React from "react";
import Card from "./Card";
import { translateImportError } from "@/utils/translateImportError";

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
