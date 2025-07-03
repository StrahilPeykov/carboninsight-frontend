// Client-side component directive for Next.js App Router
// Required for components using browser APIs like localStorage and file handling
"use client";

// React hooks for state management and DOM references
// useState: Manages dropdown visibility and modal states
// useRef: Provides direct access to file input element for programmatic triggering
import {useState, useRef} from "react";
// Lucide React chevron down icon for dropdown indicator
// Provides visual cue for expandable menu functionality
import {ChevronDown} from "lucide-react";

// Props interface for import/export dropdown component
// Supports multi-tenant product emissions data management
// Designed for section-specific data import/export workflows
interface Props {
    companyId: number;              // Company identifier for multi-tenant data isolation
    productId: number;              // Product identifier for specific emissions data context
    section: "production" | "user" | "transport";  // Emissions section type for API endpoint routing
    onImportComplete?: () => void;  // Optional callback triggered after successful import completion
    showTemplateModal?: boolean;    // External modal state for template upload prevention
    setShowTemplateModal?: React.Dispatch<React.SetStateAction<boolean>>;  // Modal state setter from parent
}

// Import/export dropdown component for emissions data management
// Provides file upload, template download, and data export functionality
// Implements section-specific API endpoints for production, user, and transport emissions
// Features template validation to prevent accidental template file uploads
// Supports both CSV and XLSX formats for broad compatibility
const ImportExportDropdown = ({companyId, productId, section, onImportComplete, showTemplateModal, setShowTemplateModal}: Props) => {
    // Dropdown visibility state for menu open/close behavior
    // Controls display of import/export options in overlay menu
    const [open, setOpen] = useState(false);
    
    // Success modal state for positive user feedback after successful imports
    // Displays confirmation message with product update notification
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // File input DOM reference for programmatic file selection triggering
    // Enables custom styled import button while using native file picker
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Section-to-API-path mapping for backend endpoint construction
    // Translates UI section names to corresponding API resource paths
    // Ensures consistent API routing across different emissions categories
    const sectionPath = {
        production: "production_energy",  // Maps to production energy emissions endpoint
        user: "user_energy",             // Maps to user energy emissions endpoint  
        transport: "transport",          // Maps to transport emissions endpoint
    }[section];

    // Asynchronous download handler for both templates and data files
    // Supports multiple file formats (CSV, XLSX) with template flag option
    // Implements secure API communication with bearer token authentication
    const handleDownload = async (
        type: "csv" | "xlsx",        // File format selection for download
        template = false             // Flag to determine template vs data download
    ) => {
        // Retrieve authentication token from localStorage for API access
        // Essential for secure multi-tenant data access control
        const token = localStorage.getItem("access_token");
        
        // Construct query parameter for template requests
        // Backend uses this flag to return empty template structure vs actual data
        const query = template ? "?template=true" : "";
        
        // Build complete API endpoint URL with all required parameters
        // Follows RESTful pattern: /companies/{id}/products/{id}/emissions/{section}/export/{format}
        const url = `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/products/${productId}/emissions/${sectionPath}/export/${type}/${query}`;

        // Execute API request with authorization header
        // Uses fetch API for modern async HTTP communication
        const response = await fetch(url, {
            headers: {Authorization: `Bearer ${token}`},
        });

        // Handle API error responses with user notification
        // Provides immediate feedback for failed download attempts
        if (!response.ok) {
            alert("Download failed.");
            return;
        }

        // Convert response to blob for file download handling
        // Blob format enables browser file save functionality
        const blob = await response.blob();
        
        // Create temporary anchor element for programmatic download
        // Modern browser-compatible approach for file downloads
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        
        // Generate descriptive filename with section and type information
        // Helps users identify downloaded files in their filesystem
        a.download = `emissions_${section}_${template ? "template" : "data"}.${type}`;
        
        // Trigger download by programmatically clicking anchor element
        a.click();
        
        // Clean up object URL to prevent memory leaks
        // Essential for proper resource management in browser
        URL.revokeObjectURL(a.href);
    };

    // Import trigger handler for custom file selection button
    // Provides styled import button while using native file picker functionality
    // Improves UX by hiding default file input styling
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    // Comprehensive file import handler with validation and error handling
    // Processes selected files, validates content, and uploads to backend API
    // Implements template file prevention and success/error feedback
    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Extract selected file from input event
        // Handles case where no file is selected gracefully
        const file = e.target.files?.[0];
        if (!file) return;

        // Template file validation to prevent accidental template uploads
        // Uses case-insensitive regex to detect "template" in filename
        // Triggers modal warning instead of processing invalid files
        if (/template/i.test(file.name)) {
            setShowTemplateModal?.(true);
            return;
        }

        // Create FormData object for multipart file upload
        // Required format for file uploads to backend API
        const formData = new FormData();
        formData.append("file", file);

        // Retrieve and validate authentication token
        // Ensures user has valid session before attempting upload
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("Missing authentication token.");
            return;
        }

        // Construct API endpoint for tabular data import
        // Follows RESTful pattern with section-specific routing
        const endpoint = `/companies/${companyId}/products/${productId}/emissions/${sectionPath}/import/tabular/`;

        try {
            // Execute POST request with file data and authentication
            // Uses FormData for proper multipart encoding
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });

            // Handle API error responses with detailed logging
            // Provides both user notification and developer debugging information
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Upload failed:", errorText);
                alert("Upload failed.");
                return;
            }

            // Process successful upload response
            // Triggers completion callback and success modal display
            const result = await response.json();
            console.log("Upload success:", result);
            
            // Notify parent component of successful import completion
            // Enables data refresh or UI updates in parent context
            if (onImportComplete) onImportComplete();
            
            // Display success modal for positive user feedback
            setShowSuccessModal(true);
            
            // Temporarily disable file input to prevent duplicate uploads
            // Prevents user confusion during processing
            if (fileInputRef.current) {
                fileInputRef.current.disabled = true;
            }

        } catch (err) {
            // Handle unexpected errors with comprehensive logging
            // Provides fallback error handling for network issues or unexpected failures
            console.error("Unexpected upload error:", err);
            alert("Unexpected error during upload.");
        }
        
        // Clear file input value to allow re-upload of same file if needed
        // Ensures onChange event fires even for identical file selections
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="relative inline-block">
            {/* Dropdown trigger button */}
            <button
                onClick={() => setOpen(!open)}
                className="bg-red text-white px-4 py-2 min-h-[44px] rounded-md ml-2 hover:bg-red-700 focus:ring focus:ring-red-500 flex items-center justify-center"
                aria-label="Open import/export menu"
            >
                <ChevronDown className="w-4 h-4"/>
            </button>

            {/* Dropdown menu with import/export options */}
            {open && (
                <div className="absolute z-10 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1 text-sm text-gray-700">
                        {/* Import option */}
                        <button onClick={handleImportClick}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                            Import from CSV/XLSX
                        </button>
                        
                        {/* Template download options */}
                        <button onClick={() => handleDownload("csv", true)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                            Download CSV Template
                        </button>
                        <button onClick={() => handleDownload("xlsx", true)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                            Download XLSX Template
                        </button>
                        
                        {/* Data export options */}
                        <button onClick={() => handleDownload("csv")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                            Download CSV File
                        </button>
                        <button onClick={() => handleDownload("xlsx")}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                            Download XLSX File
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden file input for import functionality */}
            <input
                type="file"
                accept=".csv,.xlsx"
                ref={fileInputRef}
                onChange={handleImportFile}
                className="hidden"
            />
            
            {/* Success modal for completed uploads */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Product updated
                            successfully!</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            Your product has been updated successfully. You can now view the updated emission
                            calculations.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="bg-red text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Ok
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template validation error modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Template files cannot be uploaded.
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            Please use the correct format with data filled in. Template files are for reference only.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowTemplateModal?.(false)}
                                className="bg-red text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportExportDropdown;
