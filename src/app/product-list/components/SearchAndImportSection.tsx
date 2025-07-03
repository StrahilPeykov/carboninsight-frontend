// This component handles the search functionality
// and import options for the product list
// It includes a search input, Add Product button,
// and a dropdown menu with import options
import React, { useRef, useState, useEffect } from "react";
// UI component imports for consistent styling
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
// Icon import for the dropdown toggle button
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
// Import the helpers module to use the template download functionality
import * as Helpers from "../helpers";

// TypeScript interface defining the props required by this component
// Ensures type safety for all incoming data and callback functions
interface SearchAndImportSectionProps {
  // Current search query value to display in the search input
  searchQuery: string;
  // Callback to update the search query in the parent component
  setSearchQuery: (query: string) => void;
  // Callback for handling file selection events with specific file type identifiers
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, type: "aasx" | "csv") => void;
  // Callback for displaying errors from operations
  setError: (error: string) => void;
}

// Component implementation with type-checked props
const SearchAndImportSection: React.FC<SearchAndImportSectionProps> = ({
  searchQuery,
  setSearchQuery,
  handleInputChange,
  setError,
}) => {
  // Router hook for navigation
  const router = useRouter();

  // Local state to manage dropdown menu visibility
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  
  // Refs for DOM interaction
  // Reference to the dropdown container for click-outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Hidden file input references for triggering file selection dialogs
  const aasxInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Template download handler moved from parent component
  // This handles downloading template files for imports
  const handleTemplateDownload = (type: "csv" | "xlsx") => {
    Helpers.handleTemplateDownload(type, { setError });
  };

  // Effect to handle clicks outside the dropdown to close it
  // This improves UX by allowing users to click anywhere to dismiss the dropdown
  useEffect(() => {
    // Define handler to check if click was outside the dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowImportDropdown(false);
      }
    };

    // Only add the event listener when the dropdown is open
    // This avoids unnecessary event listeners when dropdown is closed
    if (showImportDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove the event listener when component unmounts
    // or when the dropdown visibility changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showImportDropdown]);

  return (
    <div className="mb-4 flex items-center gap-2 relative" ref={dropdownRef}>
      {/* Search input container with fixed height to match buttons */}
      <div className="flex-grow min-h-[44px] max-h-[44px] h-[44px]">
        {" "}
        {/* This is the same height as the button class */}
        {/* Accessible label for screen readers */}
        <label htmlFor="product-search" className="sr-only">
          Search products by name, SKU, or manufacturer
        </label>
        {/* Search input field */}
        <input
          id="product-search"
          type="text"
          placeholder="Search by product, SKU or manufacturer name... (At least 4 characters)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-describedby="search-help"
          className="w-full h-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Screen reader help text */}
        <span id="search-help" className="sr-only">
          Enter at least 4 characters to search
        </span>
      </div>

      {/* Add Product Button */}
      <Button onClick={() => router.push(`/product-list/product`)} className="text-md truncate">
        Add Product
      </Button>

      {/* Import Dropdown Toggle Button */}
      <Button
        onClick={() => setShowImportDropdown((prev) => !prev)}
        className="text-md"
        aria-haspopup="true"
        aria-expanded={showImportDropdown}
        aria-label="Import product data"
      >
        <ChevronDown className="w-4 h-4" />
      </Button>

      {/* Hidden file inputs triggered programmatically */}
      {/* AASX/JSON/XML file input */}
      <input
        type="file"
        ref={aasxInputRef}
        accept=".aasx,.json,.xml"
        className="hidden"
        onChange={(e) => handleInputChange(e, "aasx")}
      />

      {/* CSV/XLSX file input */}
      <input
        type="file"
        ref={csvInputRef}
        accept=".csv,.xlsx"
        className="hidden"
        onChange={(e) => handleInputChange(e, "csv")}
      />

      {/* Dropdown Menu - conditionally rendered based on showImportDropdown state */}
      {showImportDropdown && (
        <Card className="absolute right-0 top-full z-10 mt-2 w-64 bg-white rounded-md shadow-lg">
          <div className="space-y-2">
            {/* Import from AASX/JSON/XML option */}
            <button
              onClick={() => aasxInputRef.current?.click()}
              className="text-left w-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Import from AAS AASX/JSON/XML
              <span className="block text-gray-400 text-xs mt-1">Max file size: 25MB</span>
            </button>

            {/* Import from CSV/XLSX option */}
            <button
              onClick={() => csvInputRef.current?.click()}
              className="text-left w-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Import from CSV/XLSX
              <span className="block text-gray-400 text-xs mt-1">Max file size: 25MB</span>
            </button>

            {/* Download CSV Template option */}
            <button
              onClick={() => handleTemplateDownload("csv")}
              className="text-left w-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Download CSV Template
              <span className="block text-gray-400 text-xs mt-1">
                Get started with a blank template
              </span>
            </button>

            {/* Download XLSX Template option */}
            <button
              onClick={() => handleTemplateDownload("xlsx")}
              className="text-left w-full hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Download XLSX Template
              <span className="block text-gray-400 text-xs mt-1">
                Get started with a blank template
              </span>
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchAndImportSection;