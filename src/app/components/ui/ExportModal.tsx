// Client-side component directive for Next.js App Router
// Required for components using React hooks and browser APIs
"use client";

// React core imports for state management, side effects, and DOM references
// useState: Manages modal state, export progress, and user feedback
// useEffect: Handles focus management, keyboard navigation, and accessibility
// useRef: Provides direct DOM access for focus trapping and modal management
import { useState, useEffect, useRef } from "react";
// ReactDOM portal functionality for rendering modal outside component tree
// Essential for proper z-index layering and accessibility isolation
import ReactDOM from "react-dom";
// Custom button component with accessibility features and consistent styling
import Button from "./Button";
// Lucide React icons for intuitive user interface elements
// Download: Success state indication, FileDown: Export action, X: Modal dismissal
import { Download, FileDown, X } from "lucide-react";
// Backend export utilities for product data export functionality
// ExportFormat: TypeScript type for export format options
// exportProduct: Generic product export for various formats
// exportProductPDFReport: Specialized PDF report generation
// getExportFormats: Available export format configuration
import {
  ExportFormat,
  exportProduct,
  exportProductPDFReport,
  getExportFormats,
} from "@/utils/backendExportUtils";
// Product API types for type safety and data structure consistency
import { Product } from "@/lib/api/productApi";

// Props interface for export modal component with required context data
// Supports controlled modal visibility and product export functionality
// Designed for integration with product management workflows
interface ExportModalProps {
  isOpen: boolean;        // Controls modal visibility and lifecycle management
  onClose: () => void;    // Callback for modal dismissal and cleanup
  product: Product;       // Product data to be exported with full type safety
  companyId: string;      // Company context for multi-tenant export operations
}

// Comprehensive export modal component with advanced accessibility and UX features
// Implements WCAG 2.1 AA compliance with focus trapping and keyboard navigation
// Supports multiple export formats with progress indication and error handling
// Features portal rendering for proper z-index management and accessibility isolation
// Includes automatic focus management and screen reader announcements
export default function ExportModal({ isOpen, onClose, product, companyId }: ExportModalProps) {
  // Export format selection state with default ZIP format for broad compatibility
  // Provides user choice between different export formats and data structures
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("zip");
  
  // Export progress state for UI feedback and interaction prevention
  // Prevents multiple simultaneous exports and provides loading indication
  const [isExporting, setIsExporting] = useState(false);
  
  // Error state management for user feedback and troubleshooting
  // Displays export failures with descriptive messages for user understanding
  const [error, setError] = useState<string | null>(null);
  
  // Success state management for positive user feedback
  // Confirms successful exports with format-specific messaging
  const [success, setSuccess] = useState<string | null>(null);

  // DOM references for advanced modal accessibility and focus management
  // modalRef: Direct modal container access for focus trapping and keyboard navigation
  // previousActiveElement: Stores focus state for proper restoration after modal closure
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Available export formats configuration from utility function
  // Provides dynamic format options with descriptions and metadata
  const exportFormats = getExportFormats();

  // Focus management and scroll prevention effect for modal accessibility
  // Implements proper modal behavior with focus restoration and background interaction prevention
  // Follows WCAG guidelines for modal dialog accessibility patterns
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element for restoration after modal closure
      // Essential for maintaining user's navigation context and screen reader position
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Prevent background scrolling while modal is active
      // Improves user experience by maintaining modal focus and preventing confusion
      document.body.style.overflow = "hidden";

      // Set initial focus to the modal container for immediate accessibility
      // Ensures screen readers and keyboard users are aware of modal activation
      modalRef.current?.focus();

      // Cleanup function for proper state restoration
      return () => {
        // Restore background scrolling capability
        document.body.style.overflow = "";
        // Return focus to previously focused element for seamless navigation
        // Critical for accessibility and user experience continuity
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen]);

  // Comprehensive keyboard navigation handler for modal accessibility
  // Implements escape key dismissal and focus trapping for WCAG compliance
  // Prevents focus from leaving modal bounds during keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key handling for intuitive modal dismissal
      // Disabled during export to prevent accidental cancellation of ongoing operations
      if (e.key === "Escape" && !isExporting) {
        handleClose();
      }

      // Focus trapping implementation for accessibility compliance
      // Ensures keyboard users cannot navigate outside modal boundaries
      if (e.key === "Tab") {
        // Query all focusable elements within modal for navigation control
        // Comprehensive selector covers all interactive elements for complete accessibility
        const focusableElements = modalRef.current?.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          // Reverse tab navigation (Shift+Tab) from first element cycles to last
          // Forward tab navigation from last element cycles to first
          // Creates seamless navigation loop within modal boundaries
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Attach keyboard event listener for modal-specific navigation
    document.addEventListener("keydown", handleKeyDown);
    // Cleanup listener to prevent memory leaks and conflicting behavior
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExporting]);

  // Asynchronous export handler with comprehensive error handling and user feedback
  // Supports multiple export formats with format-specific processing logic
  // Implements proper loading states and accessibility announcements
  const handleExport = async () => {
    // Set loading state to prevent multiple simultaneous exports
    setIsExporting(true);
    // Clear previous states for clean user feedback
    setError(null);
    setSuccess(null);

    try {
      // Format-specific export logic with different backend endpoints
      // PDF exports use specialized report generation, others use generic export
      if (selectedFormat === "pdf") {
        await exportProductPDFReport(companyId, product);
      } else {
        await exportProduct(companyId, product.id, selectedFormat, product.name);
      }

      // Set success message with specific product and format information
      setSuccess(`Successfully exported ${product.name} as ${selectedFormat.toUpperCase()}`);

      // Create screen reader announcement for export success
      // Uses ARIA live region for immediate accessibility feedback
      // Temporary DOM element ensures announcement without visual interference
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = `Export successful. ${product.name} exported as ${selectedFormat.toUpperCase()}`;
      document.body.appendChild(announcement);

      // Automatic modal closure with cleanup after success feedback display
      // Provides users time to read success message before dismissal
      setTimeout(() => {
        document.body.removeChild(announcement);
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      // Comprehensive error handling with user-friendly messaging
      // Provides specific error details when available, generic fallback otherwise
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      // Always reset loading state regardless of success or failure
      setIsExporting(false);
    }
  };

  // Modal closure handler with export state validation
  // Prevents accidental closure during active export operations
  // Ensures clean state reset for subsequent modal usage
  const handleClose = () => {
    if (!isExporting) {
      // Clear all feedback states for clean next usage
      setError(null);
      setSuccess(null);
      // Trigger parent component closure callback
      onClose();
    }
  };

  // Early return for closed modal state - prevents unnecessary rendering
  // Optimizes performance by avoiding portal creation when modal not needed
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Modal backdrop with click-to-close functionality */}
      <div className="fixed inset-0 bg-black/50 z-50" aria-hidden="true" onClick={handleClose} />

      {/* Modal container with proper positioning */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        aria-describedby="export-modal-description"
      >
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden transform shadow-xl"
          tabIndex={-1}
        >
          {/* Modal header with title and close button */}
          <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2
              id="export-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Export Product Data
            </h2>
            <Button
              variant="icon"
              onClick={handleClose}
              aria-label="Close export modal"
              disabled={isExporting}
              className="hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </header>

          {/* Modal content area */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-4">
              {/* Product information summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h3 className="font-semibold text-base mb-2 text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-medium"><abbr title="Stock Keeping Unit">SKU</abbr>:</span> {product.sku}
                  </div>
                  <div>
                    <span className="font-medium">
                      <abbr title="Product Carbon Footprint">PCF</abbr>:
                    </span>{" "}
                    <span aria-label={`${product.emission_total} kilograms CO2 equivalent`}>
                      {product.emission_total} kg CO₂e
                    </span>
                  </div>
                </div>
              </div>

              {/* Export format selection */}
              <div>
                <fieldset>
                  <legend className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    Export Format:
                  </legend>
                  <div id="export-modal-description" className="sr-only">
                    Select the format for exporting your product data
                  </div>
                  {/* Scrollable format selection area */}
                  <div className="space-y-1 max-h-48 overflow-y-auto" role="radiogroup">
                    {exportFormats.map(format => (
                      <label
                        key={format.value}
                        className="flex items-start space-x-2 p-2 border border-gray-200 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
                      >
                        {/* Radio button for format selection */}
                        <input
                          type="radio"
                          name="exportFormat"
                          value={format.value}
                          checked={selectedFormat === format.value}
                          onChange={e => setSelectedFormat(e.target.value as ExportFormat)}
                          className="mt-0.5 flex-shrink-0 text-red-600 focus:ring-red-500"
                          aria-describedby={`format-desc-${format.value}`}
                        />
                        {/* Format information */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {format.label}
                          </div>
                          <div
                            id={`format-desc-${format.value}`}
                            className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2"
                          >
                            {format.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Status messages for errors and success */}
              {error && (
                <div
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md p-3"
                  role="alert"
                  aria-live="assertive"
                >
                  <div className="flex items-center">
                    <X className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" aria-hidden="true" />
                    <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md p-3"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center">
                    <Download
                      className="h-4 w-4 text-green-400 mr-2 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal footer with action buttons */}
          <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <Button variant="outline" onClick={handleClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              aria-busy={isExporting}
              className="flex items-center space-x-2"
            >
              {/* Dynamic button content based on export state */}
              {isExporting ? (
                <>
                  <span className="sr-only">Exporting, please wait</span>
                  <div
                    className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"
                    aria-hidden="true"
                  ></div>
                  <span aria-hidden="true">Exporting...</span>
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" aria-hidden="true" />
                  <span>Export</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
