// Client-side component directive for Next.js app router
"use client";

// This component manages production energy emissions for manufacturing LCA
// (Life Cycle Assessment) calculations within the product management system.
//
// Key Responsibilities:
// - CRUD operations for production energy emissions data
// - Integration with emission reference databases for standardized factors
// - BOM (Bill of Materials) line item associations for component-level attribution
// - Override factor management for custom emission calculations
// - Import/export functionality for bulk data operations
// - Modal-based user interactions with comprehensive validation
//

// ── Imports ────────────────────────────────────────────────────────────────
// React core hooks for component lifecycle and ref forwarding
import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
// Parent page interface definitions for tab communication
import { DataPassedToTabs, TabHandle } from "../../page";
// API types for production energy emissions and related data structures
import { ProductionEnergyEmission } from "@/lib/api/productionEmissionApi";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import { LineItem } from "@/lib/api/bomApi";
// Custom UI components for consistent styling and interactions
import Button from "@/app/components/ui/Button";
// Lucide icons for semantic UI elements and actions
import { Plus, AlertCircle } from "lucide-react";
// Headless UI components for accessible modal dialogs
import {
    Dialog,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
// Custom table component with accessibility features
import { OurTable } from "@/app/components/ui/OurTable";
// API service functions for CRUD operations
import * as apiCalls from "./api-calls";
// Helper functions for modal and form management
import * as Helpers from "./helpers";
// Type definitions and column configuration factory
import { FormData, getProductionEnergyColumns } from "./types";
// Import/export functionality for data management
import ImportExportDropdown from "@/app/components/ui/ImportExportDropdown";
// Modal components for CRUD and data viewing operations
import AddEditModal from "./AddEditModal";
import OverrideFactorsModal from "./OverrideFactorsModal";

// ── ProductionEnergy Tab: Handles production energy emissions CRUD ──────────
// Main component for managing production energy emissions in manufacturing LCA
// Implements full CRUD operations with modals, validation, and data visualization
// Uses forwardRef pattern to expose tab methods to parent page component
const ProductionEnergy = forwardRef<TabHandle, DataPassedToTabs>(
    ({ productId: productIdString, onFieldChange }, ref) => {
        // ── State variables ─────────────────────────────────────────────
        // Core data state for emissions list and loading indicators
        const [emissions, setEmissions] = useState<ProductionEnergyEmission[]>([]);
        const [isLoading, setIsLoading] = useState(false);

        // Modal visibility state for different UI interactions
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

        // Current emission being edited and associated form data
        const [currentEmission, setCurrentEmission] = useState<ProductionEnergyEmission | null>(null);
        const [formData, setFormData] = useState<FormData>({
            energy_consumption: "",
            reference: "",
            override_factors: [],
            line_items: [],
        });

        // Delete operation state management
        const [deletingEmissionId, setDeletingEmissionId] = useState<number | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        // Reference data for emission factors dropdown
        const [references, setReferences] = useState<EmissionReference[]>([]);
        const [referenceQuery, setReferenceQuery] = useState("");

        // Search and filtering state
        const [query, setQuery] = useState("");

        // Template and file upload modal state
        const [showTemplateModal, setShowTemplateModal] = useState(false);

        // Override factors viewing modal state
        const [showFactorsForEmission, setShowFactorsForEmission] =
            useState<ProductionEnergyEmission | null>(null);

        // BOM line items data and associated viewing modal state
        const [bomLineItems, setBomLineItems] = useState<LineItem[]>([]);
        const [bomLineItemQuery, setBomLineItemQuery] = useState("");
        const [showBomItemsForEmission, setShowBomItemsForEmission] =
            useState<ProductionEnergyEmission | null>(null);

        // ── Duplicate file modal state for ImportExportDropdown ───────
        // State management for preventing duplicate file uploads during import operations
        const [showDuplicateModal, setShowDuplicateModal] = useState(false);

        // ── Company and product ID helpers ────────────────────────────
        // Retrieve company context from localStorage for multi-tenant operations
        // Error handling ensures graceful degradation if company context is missing
        const company_pk_string = localStorage.getItem("selected_company_id");
        if (!company_pk_string) {
            console.error("company_pk is null");
            return null;
        }
        const company_pk = parseInt(company_pk_string, 10);

        // Product ID conversion helper for consistent numeric operations
        // Wrapped in function to maintain reactivity across component lifecycle
        const productId = () => {
            const id = parseInt(productIdString, 10);
            return id;
        };

        // ── Expose saveTab/updateTab to parent ───────────────────────
        // Forward tab interface methods to parent component for coordinated saves
        // Implements TabHandle interface for consistent tab management patterns
        useImperativeHandle(ref, () => ({
            saveTab,
            updateTab,
        }));

        // ── Save tab function (stub) ─────────────────────────────────
        // Placeholder for future tab-level save operations
        // Returns empty string indicating no validation errors
        const saveTab = async (): Promise<string> => {
            return "";
        };

        // ── Update tab function (stub) ───────────────────────────────
        // Placeholder for future tab-level update operations
        // Returns empty string indicating no validation errors
        const updateTab = async (): Promise<string> => {
            return "";
        };

        // ── Fetch emissions and BOM items on mount ──────────────────
        // Load initial data when product context becomes available
        // Dependencies ensure re-fetch when product changes in parent navigation
        useEffect(() => {
            if (productIdString) {
                // Fetch emissions data with loading state management
                apiCalls.fetchEmissions(setIsLoading, company_pk, productId, setEmissions);
                // Fetch BOM line items for association with emissions
                apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
            }
        }, [productIdString]);

        // ── Fetch emission references on mount ───────────────────────
        // Load reference data for emission factor dropdown selections
        // Independent of product context as references are company-wide
        useEffect(() => {
            apiCalls.fetchReferences(setReferences);
        }, []);

        // ── Define columns of table. ─────────────────────────────────
        // Generate dynamic table configuration with event handlers
        // Passes all necessary state setters for interactive column actions
        const columns = getProductionEnergyColumns(
            references,
            setShowFactorsForEmission,
            setShowBomItemsForEmission,
            setCurrentEmission,
            setFormData,
            company_pk,
            productId,
            setBomLineItems,
            setIsModalOpen,
            setDeletingEmissionId,
            setIsDeleteModalOpen
        );

        // ── Render ───────────────────────────────────────────────────
        // Main component JSX with conditional rendering and modal management
        return (
            <>
                {/* ── Header ─────────────────────────────────────────────── */}
                {/* Page title and description for user context and navigation clarity */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Production Energy</h2>
                    <p className="mb-4">Track energy consumption during manufacturing process.</p>
                </div>

                {/* ── Emission List ───────────────────────────────────────── */}
                {isLoading ? (
                    <div className="text-center py-6">Data loading...</div>
                ) : emissions.length === 0 ? (
                    <div className="text-center py-6">No production energy emissions yet.</div>
                ) : (
                    // Data table with accessibility features and semantic structure
                    <OurTable
                        caption="A table displaying the production energy emissions of this product."
                        cardTitle="Emission #"
                        items={emissions}
                        columns={columns}
                    />
                )}

                {/* ── Add the Emission button ────────────────────────────── */}
                <div className="mt-6 justify-center gap-3">
                    {/* Primary action button for creating new emissions */}
                    <Button
                        onClick={() =>
                            Helpers.handleOpenModal(
                                setCurrentEmission,
                                setFormData,
                                company_pk,
                                productId,
                                setBomLineItems,
                                setIsModalOpen
                            )
                        }
                        className="flex items-center gap-2"
                        variant="primary"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" /> Add Production Energy
                    </Button>

                    {/* Import/export dropdown with file handling and validation */}
                    <ImportExportDropdown
                        companyId={company_pk}
                        productId={productId()}
                        section="production"
                        onImportComplete={() =>
                            apiCalls.fetchEmissions(setIsLoading, company_pk, productId, setEmissions)
                        }
                        showTemplateModal={showTemplateModal}
                        setShowTemplateModal={setShowTemplateModal}
                    />

                </div>

                {/* ── Add/Edit Modal ──────────────────────────────────────── */}
                <AddEditModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    currentEmission={currentEmission}
                    setCurrentEmission={setCurrentEmission}
                    formData={formData}
                    setFormData={setFormData}
                    references={references}
                    referenceQuery={referenceQuery}
                    setReferenceQuery={setReferenceQuery}
                    bomLineItems={bomLineItems}
                    bomLineItemQuery={bomLineItemQuery}
                    setBomLineItemQuery={setBomLineItemQuery}
                    query={query}
                    setQuery={setQuery}
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    company_pk={company_pk}
                    productId={productId}
                    onFieldChange={onFieldChange}
                    setIsLoading={setIsLoading}
                    setEmissions={setEmissions}
                />

                {/* ── Delete Confirmation Modal ───────────────────────────── */}
                {isDeleteModalOpen && (
                    <Dialog
                        open={isDeleteModalOpen}
                        as="div"
                        className="fixed inset-0 z-20 overflow-y-auto"
                        onClose={() => setIsDeleteModalOpen(false)}
                        aria-labelledby="delete-modal-title"
                    >
                        <div className="min-h-screen px-4 text-center">
                            {/* Static backdrop with semi-transparent overlay */}
                            <div className="fixed inset-0 bg-black/50" />

                            {/* Centering element for modal positioning */}
                            <span className="inline-block h-screen align-middle" aria-hidden="true">
                                &#8203;
                            </span>

                            {/* Modal content panel with responsive sizing and theming */}
                            <DialogPanel
                                className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                                {/* Modal header with warning icon and semantic title */}
                                <DialogTitle
                                    id="delete-modal-title"
                                    as="h3"
                                    className="flex items-center gap-3 mb-4 text-red"
                                >
                                    <AlertCircle className="w-6 h-6" aria-hidden="true" />
                                    <span className="text-lg font-semibold">Confirm Deletion</span>
                                </DialogTitle>

                                {/* Warning message explaining the irreversible nature of deletion */}
                                <p className="mb-6">
                                    Are you sure you want to delete this production energy emission? This action
                                    cannot be undone.
                                </p>

                                {/* Action buttons with destructive action styling */}
                                <div className="flex justify-end gap-2">
                                    {/* Cancel button maintains current state */}
                                    <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">
                                        Cancel
                                    </Button>
                                    {/* Delete button triggers API call and state updates */}
                                    <Button
                                        onClick={() =>
                                            apiCalls.handleDelete(
                                                deletingEmissionId,
                                                company_pk,
                                                productId,
                                                setEmissions,
                                                emissions,
                                                setIsDeleteModalOpen,
                                                setDeletingEmissionId,
                                                onFieldChange
                                            )
                                        }
                                        variant="primary"
                                        className="bg-red hover:bg-red-800 text-white"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </DialogPanel>
                        </div>
                    </Dialog>
                )}

                {/* ── Override Factors Modal ─────────────────────────────── */}
                <OverrideFactorsModal
                    showFactorsForEmission={showFactorsForEmission}
                    setShowFactorsForEmission={setShowFactorsForEmission}
                />


                {/* ── BOM Items Modal ────────────────────────────────────── */}
                <Dialog
                    open={!!showBomItemsForEmission}
                    as="div"
                    className="fixed inset-0 z-20 overflow-y-auto"
                    onClose={() => setShowBomItemsForEmission(null)}
                    aria-labelledby="bom-items-modal-title"
                >
                    <div className="min-h-screen px-4 text-center">
                        {/* Modal backdrop with opacity overlay */}
                        <div className="fixed inset-0 bg-black/50" />
                        {/* Vertical centering helper element */}
                        <span className="inline-block h-screen align-middle" aria-hidden="true">
                            &#8203;
                        </span>
                        {/* Modal content panel with responsive design */}
                        <DialogPanel
                            className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                            {/* Modal title with semantic heading structure */}
                            <DialogTitle
                                id="bom-items-modal-title"
                                as="h3"
                                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                            >
                                Associated BOM Items
                            </DialogTitle>

                            {/* Modal content with conditional rendering and accessibility */}
                            <div className="mt-4">
                                {/* Conditional table display based on data availability */}
                                {showBomItemsForEmission?.line_items && bomLineItems.length > 0 ? (
                                    <div className="overflow-y-auto max-h-96">
                                        {/* Accessible data table with proper ARIA roles */}
                                        <table
                                            className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                                            role="table"
                                        >
                                            {/* Screen reader caption for table context */}
                                            <caption className="sr-only">
                                                BOM items associated with emission {showBomItemsForEmission.id}
                                            </caption>
                                            {/* Table header with semantic column definitions */}
                                            <thead role="rowgroup">
                                                <tr role="row">
                                                    <th
                                                        scope="col"
                                                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                    >
                                                        ID
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                    >
                                                        Product Name
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                    >
                                                        Quantity
                                                    </th>
                                                </tr>
                                            </thead>
                                            {/* Table body with dynamic row generation */}
                                            <tbody
                                                className="divide-y divide-gray-200 dark:divide-gray-700"
                                                role="rowgroup"
                                            >
                                                {/* Map through line items with data lookup and fallback values */}
                                                {showBomItemsForEmission.line_items.map(itemId => {
                                                    const item = bomLineItems.find(i => i.id === itemId);
                                                    return (
                                                        <tr key={itemId} role="row">
                                                            <td className="px-4 py-2" role="cell">
                                                                {itemId}
                                                            </td>
                                                            <td className="px-4 py-2" role="cell">
                                                                {item ? item.line_item_product.name : "Unknown Item"}
                                                            </td>
                                                            <td className="px-4 py-2" role="cell">
                                                                {item ? item.quantity : "-"}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    // Empty state message for no data scenario
                                    <p className="text-gray-500 dark:text-gray-300">No BOM items found.</p>
                                )}
                            </div>

                            {/* Modal footer with close action */}
                            <div className="mt-6">
                                <Button
                                    onClick={() => setShowBomItemsForEmission(null)}
                                    variant="primary"
                                    className="w-full"
                                >
                                    Close
                                </Button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>
                {/* ── Template File Blocked Modal ───────────────────────── */}
                {showTemplateModal && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
                            {/* Modal header with error context */}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Template File Blocked
                            </h3>
                            {/* User guidance message explaining file type restrictions */}
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                Template files cannot be uploaded. Please provide a valid data file instead.
                            </p>
                            {/* Close action with error styling */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowTemplateModal(false)}
                                    className="bg-red text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* ── Duplicate File Upload Blocked Modal ───────────────── */}
                {showDuplicateModal && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
                            {/* Modal header with duplicate prevention context */}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Duplicate File Upload Blocked
                            </h3>
                            {/* User guidance for file selection alternatives */}
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                This file has already been uploaded. Please select a different file.
                            </p>
                            {/* Close action with error styling */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowDuplicateModal(false)}
                                    className="bg-red text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
);

// Component display name for development debugging and React DevTools
// Essential for proper component identification in debugging scenarios
ProductionEnergy.displayName = "ProductionEnergy";
export default ProductionEnergy;
