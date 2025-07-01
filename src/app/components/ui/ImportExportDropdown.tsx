"use client";

import {useState, useRef} from "react";
import {ChevronDown} from "lucide-react";
import {fetchEmissions} from "@/app/product-list/product/tabs/production-energy/api-calls";

interface Props {
    companyId: number;
    productId: number;
    section: "production" | "user" | "transport";
    onImportComplete?: () => void;
    showTemplateModal?: boolean;
    setShowTemplateModal?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImportExportDropdown = ({companyId, productId, section, onImportComplete, showTemplateModal, setShowTemplateModal}: Props) => {
    const [open, setOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const sectionPath = {
        production: "production_energy",
        user: "user_energy",
        transport: "transport",
    }[section];

    const handleDownload = async (
        type: "csv" | "xlsx",
        template = false
    ) => {
        const token = localStorage.getItem("access_token");
        const query = template ? "?template=true" : "";
        const url = `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/products/${productId}/emissions/${sectionPath}/export/${type}/${query}`;

        const response = await fetch(url, {
            headers: {Authorization: `Bearer ${token}`},
        });

        if (!response.ok) {
            alert("Download failed.");
            return;
        }

        const blob = await response.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `emissions_${section}_${template ? "template" : "data"}.${type}`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Prevent uploading if filename contains 'template'
        if (/template/i.test(file.name)) {
            setShowTemplateModal?.(true);
            return;
        }


        const formData = new FormData();

        formData.append("file", file);

        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("Missing authentication token.");
            return;
        }

        const endpoint = `/companies/${companyId}/products/${productId}/emissions/${sectionPath}/import/tabular/`;

        try {
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

            const result = await response.json();
            console.log("Upload success:", result);
            if (onImportComplete) onImportComplete();
            setShowSuccessModal(true);
            if (fileInputRef.current) {
                fileInputRef.current.disabled = true;
            }

        } catch (err) {
            console.error("Unexpected upload error:", err);
            alert("Unexpected error during upload.");
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setOpen(!open)}
                className="bg-red text-white px-4 py-2 min-h-[44px] rounded-md ml-2 hover:bg-red-700 focus:ring focus:ring-red-500 flex items-center justify-center"
                aria-label="Open import/export menu"
            >
                <ChevronDown className="w-4 h-4"/>
            </button>

            {open && (
                <div className="absolute z-10 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1 text-sm text-gray-700">
                        <button onClick={handleImportClick}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                            Import from CSV/XLSX
                        </button>
                        <button onClick={() => handleDownload("csv", true)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                            Download CSV Template
                        </button>
                        <button onClick={() => handleDownload("xlsx", true)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                            Download XLSX Template
                        </button>
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

            <input
                type="file"
                accept=".csv,.xlsx"
                ref={fileInputRef}
                onChange={handleImportFile}
                className="hidden"
            />
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