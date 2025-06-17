"use client";

import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Button from "./Button";
import { Download, FileDown, X } from "lucide-react";
import {
  ExportFormat,
  exportProduct,
  exportProductPDFReport,
  getExportFormats,
} from "@/utils/backendExportUtils";
import { Product } from "@/lib/api/productApi";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  companyId: string;
}

export default function ExportModal({ isOpen, onClose, product, companyId }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("zip");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const exportFormats = getExportFormats();

  // Store previously focused element and lock background scroll
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      // Set initial focus to the modal
      modalRef.current?.focus();

      return () => {
        document.body.style.overflow = "";
        // Return focus to previously focused element
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isExporting) {
        handleClose();
      }

      // Trap focus within modal
      if (e.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

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

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExporting]);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(null);

    try {
      if (selectedFormat === "pdf") {
        await exportProductPDFReport(companyId, product);
      } else {
        await exportProduct(companyId, product.id, selectedFormat, product.name);
      }

      setSuccess(`Successfully exported ${product.name} as ${selectedFormat.toUpperCase()}`);

      // Announce success to screen readers
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = `Export successful. ${product.name} exported as ${selectedFormat.toUpperCase()}`;
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" aria-hidden="true" onClick={handleClose} />

      {/* Modal */}
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
          {/* Header */}
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

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-4">
              {/* Product Info - Compact */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h3 className="font-semibold text-base mb-2 text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-medium">SKU:</span> {product.sku}
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

              {/* Format Selection */}
              <div>
                <fieldset>
                  <legend className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    Export Format:
                  </legend>
                  <div id="export-modal-description" className="sr-only">
                    Select the format for exporting your product data
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto" role="radiogroup">
                    {exportFormats.map(format => (
                      <label
                        key={format.value}
                        className="flex items-start space-x-2 p-2 border border-gray-200 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
                      >
                        <input
                          type="radio"
                          name="exportFormat"
                          value={format.value}
                          checked={selectedFormat === format.value}
                          onChange={e => setSelectedFormat(e.target.value as ExportFormat)}
                          className="mt-0.5 flex-shrink-0 text-red-600 focus:ring-red-500"
                          aria-describedby={`format-desc-${format.value}`}
                        />
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

              {/* Status Messages */}
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

          {/* Footer with Action Buttons */}
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
