/**
 * ImportExportDropdown component provides import/export functionality for emission data.
 * Supports CSV and XLSX formats with template downloads and data import validation.
 * Includes modal feedback, file validation, and proper error handling for user guidance.
 */

"use client";

import {useState, useRef} from "react";
import {ChevronDown} from "lucide-react";

// Interface defining props for ImportExportDropdown component
interface Props {
    companyId: number; // Company identifier for API calls
    productId: number; // Product identifier for API calls
    section: "production" | "user" | "transport"; // Emission section type
    onImportComplete?: () => void; // Callback for successful import completion
    showTemplateModal?: boolean; // External state for template validation modal
    setShowTemplateModal?: React.Dispatch<React.SetStateAction<boolean>>; // State setter for template modal
}

/**
 * ImportExportDropdown component for emission data management
 * @param companyId - Company ID for API authentication and data scope
 * @param productId - Product ID for specific product emission data
 * @param section - Emission section type (production, user, or transport)
 * @param onImportComplete - Callback executed when import operation succeeds
 * @param showTemplateModal - Boolean controlling template error modal visibility
 * @param setShowTemplateModal - Function to control template modal state
 * @returns Dropdown interface with import/export options and validation feedback
 */
const ImportExportDropdown = ({companyId, productId, section, onImportComplete, showTemplateModal, setShowTemplateModal}: Props) => {
    // State management for dropdown and modal functionality
    const [open, setOpen] = useState(false); // Controls dropdown menu visibility
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Controls success feedback modal
    const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to hidden file input

    // Map section names to API endpoint paths
    const sectionPath = {
        production: "production_energy",
        user: "user_energy", 
        transport: "transport",
    }[section];

    /**
     * Handles file download requests for templates and data exports
     * @param type - File format type (csv or xlsx)
     * @param template - Whether to download template or actual data
     */
    const handleDownload = async (
        type: "csv" | "xlsx",
        template = false
    ) => {
        const token = localStorage.getItem("access_token");
        const query = template ? "?template=true" : ""; // Add template parameter if needed
        const url = `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/products/${productId}/emissions/${sectionPath}/export/${type}/${query}`;

        const response = await fetch(url, {
            headers: {Authorization: `Bearer ${token}`},
        });

        // Handle download failure
        if (!response.ok) {
            alert("Download failed.");
            return;
        }

        // Create and trigger download of the file
        const blob = await response.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `emissions_${section}_${template ? "template" : "data"}.${type}`;
        a.click();
        URL.revokeObjectURL(a.href); // Clean up object URL
    };

    /**
     * Triggers the hidden file input for import functionality
     */
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    /**
     * Handles file selection and upload process with validation
     * @param e - File input change event containing selected file
     */
    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Prevent uploading template files (validation by filename)
        if (/template/i.test(file.name)) {
            setShowTemplateModal?.(true);
            return;
        }

        // Prepare form data for file upload
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("Missing authentication token.");
            return;
        }

        const endpoint = `/companies/${companyId}/products/${productId}/emissions/${sectionPath}/import/tabular/`;

        try {
            // Submit file to backend API
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`},
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Upload failed:", errorText);
                alert("Upload failed.");
                return;
            }

            // Handle successful upload
            const result = await response.json();
            console.log("Upload success:", result);
            if (onImportComplete) onImportComplete(); // Trigger callback
            setShowSuccessModal(true); // Show success feedback
            
            // Temporarily disable file input to prevent multiple uploads
            if (fileInputRef.current) {
                fileInputRef.current.disabled = true;
            }

        } catch (err) {
            console.error("Unexpected upload error:", err);
            alert("Unexpected error during upload.");
        }
        
        // Reset file input value to allow re-selection of same file
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
