"use client";

// ── Imports ────────────────────────────────────────────────────────────────
import React, {forwardRef, useImperativeHandle, useState, useEffect} from "react";
import {DataPassedToTabs, TabHandle} from "../../page";
import {ProductionEnergyEmission} from "@/lib/api/productionEmissionApi";
import {EmissionReference} from "@/lib/api/emissionReferenceApi";
import {LineItem} from "@/lib/api/bomApi";
import Button from "@/app/components/ui/Button";
import {Info, Plus, X, AlertCircle, ChevronDown} from "lucide-react";
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
import {Tooltip} from "../components/ToolTip";
import {OurTable} from "@/app/components/ui/OurTable";
import * as apiCalls from "./api-calls";
import * as Helpers from "./helpers";
import {FormData, getProductionEnergyColumns, lifecycleOptions} from "./types";
import ImportExportDropdown from "@/app/components/ui/ImportExportDropdown";

// ── ProductionEnergy Tab: Handles production energy emissions CRUD ──────────
const ProductionEnergy = forwardRef<TabHandle, DataPassedToTabs>(
    ({productId: productIdString, onFieldChange}, ref) => {
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
                        <Plus className="w-4 h-4" aria-hidden="true"/> Add Production Energy
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

                {/* ── Add/Edit Emission Modal ────────────────────────────── */}
                <Dialog
                    open={isModalOpen}
                    as="div"
                    className="fixed inset-0 z-20 pt-12 overflow-y-auto"
                    onClose={() => Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission)}
                    aria-labelledby="emission-modal-title"
                >
                    <div className="min-h-screen px-4 text-center">
                        {/* Static backdrop */}
                        <div className="fixed inset-0 bg-black/50"/>

                        {/* This element centers the modal contents */}
                        <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

                        <DialogPanel
                            className="relative inline-block w-full max-w-lg p-6 my-8 overflow-visible text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                            <div className="flex justify-between items-center mb-4">
                                <DialogTitle
                                    id="emission-modal-title"
                                    as="h3"
                                    className="text-lg font-semibold text-gray-900 dark:text-white"
                                >
                                    {currentEmission ? "Edit" : "Add"} Production Energy
                                </DialogTitle>
                                <button
                                    onClick={() => Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission)}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Close production energy dialog"
                                >
                                    <X className="w-5 h-5" aria-hidden="true"/>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* ── Energy Consumption Section ── */}
                                <div>
                                    <label
                                        htmlFor="energy_consumption"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Energy Consumption (kWh) *
                                    </label>
                                    <input
                                        type="number"
                                        id="energy_consumption"
                                        min="0"
                                        step="0.01"
                                        value={formData.energy_consumption}
                                        onChange={e => setFormData({...formData, energy_consumption: e.target.value})}
                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        aria-describedby="energy-consumption-help"
                                    />
                                    <span id="energy-consumption-help" className="sr-only">
                    Enter the energy consumption in kilowatt hours
                  </span>
                                </div>

                                {/* ── Reference Section ── */}
                                <div>
                                    <label
                                        htmlFor="reference-select"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Reference
                                    </label>
                                    <div className="relative">
                                        {/* Reference Combobox */}
                                        <Combobox
                                            value={
                                                formData.reference
                                                    ? references.find(ref => ref.id.toString() === formData.reference)
                                                    ?.name || ""
                                                    : ""
                                            }
                                            onChange={(value: string | null) => {
                                                if (!value) {
                                                    setFormData({...formData, reference: ""});
                                                    return;
                                                }
                                                const selected = references.find(ref => ref.name === value);
                                                setFormData({
                                                    ...formData,
                                                    reference: selected ? selected.id.toString() : "",
                                                });
                                            }}
                                        >
                                            <div
                                                className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                                                <ComboboxInput
                                                    id="reference-select"
                                                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                                                    displayValue={(value: string) => value}
                                                    onChange={event => setReferenceQuery(event.target.value)}
                                                    placeholder="Select a reference"
                                                    aria-describedby="reference-help"
                                                />
                                                <ComboboxButton
                                                    className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                                                </ComboboxButton>
                                            </div>
                                            <span id="reference-help" className="sr-only">
                        Select an emission reference database for calculations
                      </span>
                                            <div className="relative w-full">
                                                <ComboboxOptions
                                                    className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {references
                                                        .filter(
                                                            ref =>
                                                                referenceQuery === "" ||
                                                                ref.name.toLowerCase().includes(referenceQuery.toLowerCase())
                                                        )
                                                        .map(ref => (
                                                            <ComboboxOption
                                                                key={ref.id}
                                                                value={ref.name}
                                                                className="relative cursor-default select-none w-full py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                                                            >
                                                                {ref.name}
                                                            </ComboboxOption>
                                                        ))}
                                                </ComboboxOptions>
                                            </div>
                                        </Combobox>
                                    </div>
                                </div>

                                {/* ── BOM Line Items Section ── */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Associated Bill of Materials Items
                                    </label>

                                    {/* Display selected BOM items as tags */}
                                    {formData.line_items.length > 0 && (
                                        <div
                                            className="flex flex-wrap gap-2 mb-2"
                                            role="list"
                                            aria-label="Selected BOM items"
                                        >
                                            {formData.line_items.map(itemId => {
                                                const item = bomLineItems.find(i => i.id === itemId);
                                                return (
                                                    <div
                                                        key={itemId}
                                                        className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                                                        role="listitem"
                                                    >
                                                        <span>{item ? item.line_item_product.name : `Item #${itemId}`}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({
                                                                    ...formData,
                                                                    line_items: formData.line_items.filter(id => id !== itemId),
                                                                });
                                                            }}
                                                            className="text-gray-500 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                                            aria-label={`Remove ${item ? item.line_item_product.name : `Item ${itemId}`} from selection`}
                                                        >
                                                            <X className="w-3 h-3" aria-hidden="true"/>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* BOM Items combobox */}
                                    <div className="relative">
                                        <Combobox
                                            value=""
                                            onChange={(value: any) => {
                                                if (value && !formData.line_items.includes(value)) {
                                                    setFormData({
                                                        ...formData,
                                                        line_items: [...formData.line_items, value],
                                                    });
                                                }
                                            }}
                                        >
                                            <div
                                                className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                                                <ComboboxInput
                                                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                                                    displayValue={() => bomLineItemQuery}
                                                    onChange={event => setBomLineItemQuery(event.target.value)}
                                                    placeholder="Select BOM items to associate"
                                                    aria-describedby="bom-items-help"
                                                />
                                                <ComboboxButton
                                                    className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                                                </ComboboxButton>
                                            </div>
                                            <span id="bom-items-help" className="sr-only">
                        Select bill of materials items to associate with this emission
                      </span>
                                            <div className="relative w-full">
                                                <ComboboxOptions
                                                    className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {bomLineItems.length === 0 ? (
                                                        <div
                                                            className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                                                            No BOM items available. Add items in the Bill of Materials
                                                            tab first.
                                                        </div>
                                                    ) : bomLineItems.filter(
                                                        item =>
                                                            !formData.line_items.includes(item.id) &&
                                                            (bomLineItemQuery === "" ||
                                                                item.line_item_product.name
                                                                    .toLowerCase()
                                                                    .includes(bomLineItemQuery.toLowerCase()))
                                                    ).length === 0 ? (
                                                        <div
                                                            className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                                                            {bomLineItemQuery === ""
                                                                ? "All BOM items already selected."
                                                                : "No matching items found."}
                                                        </div>
                                                    ) : (
                                                        bomLineItems
                                                            .filter(
                                                                item =>
                                                                    !formData.line_items.includes(item.id) &&
                                                                    (bomLineItemQuery === "" ||
                                                                        item.line_item_product.name
                                                                            .toLowerCase()
                                                                            .includes(bomLineItemQuery.toLowerCase()))
                                                            )
                                                            .map(item => (
                                                                <ComboboxOption
                                                                    key={item.id}
                                                                    value={item.id}
                                                                    className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                                                                >
                                                                    {item.line_item_product.name}
                                                                </ComboboxOption>
                                                            ))
                                                    )}
                                                </ComboboxOptions>
                                            </div>
                                        </Combobox>
                                    </div>
                                </div>

                                {/* ── Override Factors Section ── */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Override Reference Emissions
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => Helpers.handleAddOverrideFactor(setFormData, formData)}
                                            className="text-sm text-red hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                                        >
                                            + Add Override
                                        </button>
                                    </div>

                                    {formData.override_factors.map((factor, index) => (
                                        <div
                                            key={index}
                                            className="mb-4 border p-3 rounded-lg dark:border-gray-700 relative"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    Helpers.handleRemoveOverrideFactor(formData, setFormData, index)
                                                }
                                                className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                                aria-label={`Remove override factor ${index + 1}`}
                                            >
                                                <X className="w-4 h-4" aria-hidden="true"/>
                                            </button>

                                            <label
                                                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Lifecycle Stage
                                            </label>
                                            <div className="relative mb-3">
                                                <Combobox
                                                    value={
                                                        (factor.lifecycle_stage
                                                            ? lifecycleOptions.find(opt =>
                                                                opt.startsWith(factor.lifecycle_stage ?? "")
                                                            )
                                                            : "") ?? ""
                                                    }
                                                    onChange={value => {
                                                        const enumValue = Helpers.getLifecycleEnumValue(value);
                                                        Helpers.handleOverrideFactorChange(
                                                            formData,
                                                            setFormData,
                                                            index,
                                                            "name",
                                                            enumValue
                                                        );
                                                    }}
                                                >
                                                    <div
                                                        className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                                                        <ComboboxInput
                                                            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                                                            displayValue={(value: string | null) => value || ""}
                                                            onChange={event => setQuery(event.target.value)}
                                                            placeholder="Select lifecycle stage"
                                                            aria-label={`Lifecycle stage for override factor ${index + 1}`}
                                                        />
                                                        <ComboboxButton
                                                            className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                            <ChevronDown className="h-5 w-5 text-gray-400"
                                                                         aria-hidden="true"/>
                                                        </ComboboxButton>
                                                    </div>
                                                    <div className="relative w-full">
                                                        <ComboboxOptions
                                                            className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                            {lifecycleOptions.filter(
                                                                option =>
                                                                    query === "" || option.toLowerCase().includes(query.toLowerCase())
                                                            ).length === 0 ? (
                                                                <div
                                                                    className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                                                                    No matching lifecycle stages found.
                                                                </div>
                                                            ) : (
                                                                lifecycleOptions
                                                                    .filter(
                                                                        option =>
                                                                            query === "" ||
                                                                            option.toLowerCase().includes(query.toLowerCase())
                                                                    )
                                                                    .map((option, i) => (
                                                                        <ComboboxOption
                                                                            key={i}
                                                                            value={option}
                                                                            className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white data-focus:bg-red-100 dark:data-focus:bg-red data-hover:bg-gray-100 dark:data-hover:bg-gray-600"
                                                                        >
                                                                            {option}
                                                                        </ComboboxOption>
                                                                    ))
                                                            )}
                                                        </ComboboxOptions>
                                                    </div>
                                                </Combobox>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label
                                                        className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Impact (biogenic) kg CO₂-eq
                                                        <Tooltip
                                                            content={
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    <div>LCIA method: IPCC 2021 (incl. biogenic CO2)
                                                                    </div>
                                                                    <div>Impact category: climate change: biogenic
                                                                        (incl. CO2)
                                                                    </div>
                                                                    <div>Indicator: GWP100</div>
                                                                </div>
                                                            }
                                                        >
                                                            <Info className="w-4 h-4 text-gray-400"/>
                                                        </Tooltip>
                                                    </label>
                                                    <input
                                                        id={`biogenic-factor-${index}`}
                                                        type="number"
                                                        value={factor.co_2_emission_factor_biogenic}
                                                        onChange={e =>
                                                            Helpers.handleOverrideFactorChange(
                                                                formData,
                                                                setFormData,
                                                                index,
                                                                "biogenic",
                                                                e.target.value
                                                            )
                                                        }
                                                        min={0}
                                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        aria-label={`Biogenic CO2 emission factor for override ${index + 1}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Impact (non-biogenic) kg CO₂-eq
                                                        <Tooltip
                                                            content={
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    <div>LCIA method: IPCC 2021</div>
                                                                    <div>
                                                                        Impact category: climate change: total (excl.
                                                                        biogenic CO2,
                                                                        incl. SLCFs)
                                                                    </div>
                                                                    <div>Indicator: GWP100</div>
                                                                </div>
                                                            }
                                                        >
                                                            <Info className="w-4 h-4 text-gray-400"/>
                                                        </Tooltip>
                                                    </label>
                                                    <input
                                                        id={`non-biogenic-factor-${index}`}
                                                        type="number"
                                                        value={factor.co_2_emission_factor_non_biogenic}
                                                        onChange={e =>
                                                            Helpers.handleOverrideFactorChange(
                                                                formData,
                                                                setFormData,
                                                                index,
                                                                "non_biogenic",
                                                                e.target.value
                                                            )
                                                        }
                                                        min={0}
                                                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        aria-label={`Non-biogenic CO2 emission factor for override ${index + 1}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Modal Actions ── */}
                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-t-gray-700">
                                <Button
                                    onClick={() => Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission)}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() =>
                                        apiCalls.handleSubmit(
                                            formData,
                                            setIsSubmitting,
                                            currentEmission,
                                            company_pk,
                                            productId,
                                            setIsModalOpen,
                                            onFieldChange,
                                            setIsLoading,
                                            setEmissions
                                        )
                                    }
                                    variant="primary"
                                    disabled={isSubmitting || !formData.energy_consumption}
                                    aria-busy={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

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
                            <div className="fixed inset-0 bg-black/50"/>

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
                                    <AlertCircle className="w-6 h-6" aria-hidden="true"/>
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
                <Dialog
                    open={!!showFactorsForEmission}
                    as="div"
                    className="fixed inset-0 z-20 overflow-y-auto"
                    onClose={() => setShowFactorsForEmission(null)}
                    aria-labelledby="factors-modal-title"
                >
                    <div className="min-h-screen px-4 text-center">
                        {/* Static backdrop */}
                        <div className="fixed inset-0 bg-black/50"/>

                        {/* This element centers the modal contents */}
                        <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

                        <DialogPanel
                            className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                            <DialogTitle
                                id="factors-modal-title"
                                as="h3"
                                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                            >
                                Overrides
                            </DialogTitle>

                            <div className="mt-4">
                                {showFactorsForEmission?.override_factors &&
                                showFactorsForEmission.override_factors.length > 0 ? (
                                    <table
                                        className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                                        role="table"
                                    >
                                        <caption className="sr-only">
                                            Override factors for emission {showFactorsForEmission.id}
                                        </caption>
                                        <thead role="rowgroup">
                                        <tr role="row">
                                            <th
                                                scope="col"
                                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                            >
                                                Lifecycle Stage
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                            >
                                                CO₂ Emission Factor
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody
                                            className="divide-y divide-gray-200 dark:divide-gray-700"
                                            role="rowgroup"
                                        >
                                        {showFactorsForEmission.override_factors.map((factor, index) => (
                                            <tr key={index} role="row">
                                                <td
                                                    className="px-4 py-2 text-sm text-gray-900 dark:text-white"
                                                    role="cell"
                                                >
                                                    {lifecycleOptions.find(opt =>
                                                        opt.startsWith(factor.lifecycle_stage ?? "")
                                                    ) || factor.lifecycle_stage}
                                                </td>
                                                <td
                                                    className="px-4 py-2 text-sm text-gray-900 dark:text-white"
                                                    role="cell"
                                                >
                                                    <div>Bio: {factor.co_2_emission_factor_biogenic}</div>
                                                    <div>Non-bio: {factor.co_2_emission_factor_non_biogenic}</div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-300">No overrides found.</p>
                                )}
                            </div>

                            <div className="mt-6">
                                <Button
                                    onClick={() => setShowFactorsForEmission(null)}
                                    variant="primary"
                                    className="w-full"
                                >
                                    Close
                                </Button>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* ── BOM Items Modal ────────────────────────────────────── */}
                <Dialog
                    open={!!showBomItemsForEmission}
                    as="div"
                    className="fixed inset-0 z-20 overflow-y-auto"
                    onClose={() => setShowBomItemsForEmission(null)}
                    aria-labelledby="bom-items-modal-title"
                >
                    <div className="min-h-screen px-4 text-center">
                        <div className="fixed inset-0 bg-black/50"/>
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
