"use client";

// ── Imports ────────────────────────────────────────────────────────────────
import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { DataPassedToTabs, TabHandle } from "../../page";
import { ProductionEnergyEmission } from "@/lib/api/productionEmissionApi";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import { LineItem } from "@/lib/api/bomApi";
import Button from "@/app/components/ui/Button";
import { Info, Plus, X, AlertCircle, ChevronDown } from "lucide-react";
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
    Dialog,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { Tooltip } from "../components/ToolTip";
import { OurTable } from "@/app/components/ui/OurTable";
import * as apiCalls from "./api-calls";
import * as Helpers from "./helpers";
import { FormData, getProductionEnergyColumns, lifecycleOptions } from "./types";
import ImportExportDropdown from "@/app/components/ui/ImportExportDropdown";
import AddEditModal from "./AddEditModal";
import OverrideFactorsModal from "./OverrideFactorsModal";

// ── ProductionEnergy Tab: Handles production energy emissions CRUD ──────────
const ProductionEnergy = forwardRef<TabHandle, DataPassedToTabs>(
    ({ productId: productIdString, onFieldChange }, ref) => {
        // ── State variables ─────────────────────────────────────────────
        const [emissions, setEmissions] = useState<ProductionEnergyEmission[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
        const [currentEmission, setCurrentEmission] = useState<ProductionEnergyEmission | null>(null);
        const [formData, setFormData] = useState<FormData>({
            energy_consumption: "",
            reference: "",
            override_factors: [],
            line_items: [],
        });
        const [deletingEmissionId, setDeletingEmissionId] = useState<number | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [references, setReferences] = useState<EmissionReference[]>([]);
        const [referenceQuery, setReferenceQuery] = useState("");
        const [query, setQuery] = useState("");
        const [showTemplateModal, setShowTemplateModal] = useState(false);
        const [showFactorsForEmission, setShowFactorsForEmission] =
            useState<ProductionEnergyEmission | null>(null);
        const [bomLineItems, setBomLineItems] = useState<LineItem[]>([]);
        const [bomLineItemQuery, setBomLineItemQuery] = useState("");
        const [showBomItemsForEmission, setShowBomItemsForEmission] =
            useState<ProductionEnergyEmission | null>(null);

        // ── Duplicate file modal state for ImportExportDropdown ───────
        const [showDuplicateModal, setShowDuplicateModal] = useState(false);

        // ── Company and product ID helpers ────────────────────────────
        const company_pk_string = localStorage.getItem("selected_company_id");
        if (!company_pk_string) {
            console.error("company_pk is null");
            return null;
        }
        const company_pk = parseInt(company_pk_string, 10);

        const productId = () => {
            const id = parseInt(productIdString, 10);
            // if (isNaN(id)) {
            //     throw new Error("productId is not a number");
            // }
            return id;
        };

        // ── Expose saveTab/updateTab to parent ───────────────────────
        useImperativeHandle(ref, () => ({
            saveTab,
            updateTab,
        }));

        // ── Save tab function (stub) ─────────────────────────────────
        const saveTab = async (): Promise<string> => {
            return "";
        };

        // ── Update tab function (stub) ───────────────────────────────
        const updateTab = async (): Promise<string> => {
            return "";
        };

        // ── Fetch emissions and BOM items on mount ──────────────────
        useEffect(() => {
            if (productIdString) {
                apiCalls.fetchEmissions(setIsLoading, company_pk, productId, setEmissions);
                apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
            }
        }, [productIdString]);

        // ── Fetch emission references on mount ───────────────────────
        useEffect(() => {
            apiCalls.fetchReferences(setReferences);
        }, []);

        // ── Define columns of table. ─────────────────────────────────
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

        const id = productId();

        // ── Render ───────────────────────────────────────────────────
        return (
            <>
                {/* ── Header ─────────────────────────────────────────────── */}
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
                    <OurTable
                        caption="A table displaying the production energy emissions of this product."
                        cardTitle="Emission #"
                        items={emissions}
                        columns={columns}
                    />
                )}

                {/* ── Add the Emission button ────────────────────────────── */}
                <div className="mt-6 justify-center gap-3">
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
                            {/* Static backdrop */}
                            <div className="fixed inset-0 bg-black/50" />

                            {/* This element centers the modal contents */}
                            <span className="inline-block h-screen align-middle" aria-hidden="true">
                                &#8203;
                            </span>

                            <DialogPanel
                                className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                                <DialogTitle
                                    id="delete-modal-title"
                                    as="h3"
                                    className="flex items-center gap-3 mb-4 text-red"
                                >
                                    <AlertCircle className="w-6 h-6" aria-hidden="true" />
                                    <span className="text-lg font-semibold">Confirm Deletion</span>
                                </DialogTitle>

                                <p className="mb-6">
                                    Are you sure you want to delete this production energy emission? This action
                                    cannot be undone.
                                </p>

                                <div className="flex justify-end gap-2">
                                    <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">
                                        Cancel
                                    </Button>
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
                        <div className="fixed inset-0 bg-black/50" />
                        <span className="inline-block h-screen align-middle" aria-hidden="true">
                            &#8203;
                        </span>
                        <DialogPanel
                            className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                            <DialogTitle
                                id="bom-items-modal-title"
                                as="h3"
                                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                            >
                                Associated BOM Items
                            </DialogTitle>

                            <div className="mt-4">
                                {showBomItemsForEmission?.line_items && bomLineItems.length > 0 ? (
                                    <div className="overflow-y-auto max-h-96">
                                        <table
                                            className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                                            role="table"
                                        >
                                            <caption className="sr-only">
                                                BOM items associated with emission {showBomItemsForEmission.id}
                                            </caption>
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
                                            <tbody
                                                className="divide-y divide-gray-200 dark:divide-gray-700"
                                                role="rowgroup"
                                            >
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
                                    <p className="text-gray-500 dark:text-gray-300">No BOM items found.</p>
                                )}
                            </div>

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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Template File Blocked
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                Template files cannot be uploaded. Please provide a valid data file instead.
                            </p>
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Duplicate File Upload Blocked
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                This file has already been uploaded. Please select a different file.
                            </p>
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

ProductionEnergy.displayName = "ProductionEnergy";
export default ProductionEnergy;
