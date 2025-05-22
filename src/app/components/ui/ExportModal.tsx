"use client";

import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Button from "./Button";
import { Download, FileDown, X } from "lucide-react";
import {
  ExportFormat,
  exportProduct,
  exportProductPDFReport,
  getExportFormats,
} from "@/utils/backendExportUtils";

interface Product {
  id: string;
  name: string;
  description: string;
  manufacturer_name: string;
  sku: string;
  supplier: string;
  emission_total: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  companyId: string;
}

export default function ExportModal({ isOpen, onClose, product, companyId }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const exportFormats = getExportFormats();

  // Lock background scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

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
      setTimeout(() => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden transform shadow-xl">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Export Product Data
          </h2>
          <Button
            variant="icon"
            onClick={handleClose}
            aria-label="Close"
            disabled={isExporting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
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
                  <span className="font-medium">PCF:</span> {product.emission_total} kg CO₂e
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                Export Format:
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
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
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {format.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {format.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md p-3">
                <div className="flex items-center">
                  <X className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md p-3">
                <div className="flex items-center">
                  <Download className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
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
            className="flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                <span>Export</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
