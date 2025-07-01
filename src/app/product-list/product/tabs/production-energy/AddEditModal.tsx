"use client";

/* Imports */
import React from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from "@headlessui/react";
import { Info, X, ChevronDown } from "lucide-react";
import Button from "@/app/components/ui/Button";
import { Tooltip } from "../components/ToolTip";

import { ProductionEnergyEmission } from "@/lib/api/productionEmissionApi";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import { LineItem } from "@/lib/api/bomApi";

import * as apiCalls from "./api-calls";
import * as Helpers from "./helpers";
import { FormData, lifecycleOptions } from "./types";
import { on } from "node:stream";
import BomLineItemsSection from "./BomLineItemsSection";
import ReferenceSection from "./ReferenceSection";

/* Prop types for AddEditModal, extending off from OverrideFactorsModal */
type AddEditModalProps = {
    /* modal control */
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

    /* emission being edited */
    currentEmission: ProductionEnergyEmission | null;
    setCurrentEmission: React.Dispatch<
        React.SetStateAction<ProductionEnergyEmission | null>
    >;

    /* form state */
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;

    /* reference list */
    references: EmissionReference[];
    referenceQuery: string;
    setReferenceQuery: React.Dispatch<React.SetStateAction<string>>;

    /* BOM items */
    bomLineItems: LineItem[];
    bomLineItemQuery: string;
    setBomLineItemQuery: React.Dispatch<React.SetStateAction<string>>;

    /* lifecycle search */
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;

    /* submit state */
    isSubmitting: boolean;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;

    /* parent helpers */
    company_pk: number;
    productId: () => number;
    onFieldChange: () => void;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setEmissions: React.Dispatch<
        React.SetStateAction<ProductionEnergyEmission[]>
    >;
};

/* Component */
const AddEditModal: React.FC<AddEditModalProps> = ({
    isModalOpen,
    setIsModalOpen,
    currentEmission,
    setCurrentEmission,
    formData,
    setFormData,
    references,
    referenceQuery,
    setReferenceQuery,
    bomLineItems,
    bomLineItemQuery,
    setBomLineItemQuery,
    query,
    setQuery,
    isSubmitting,
    setIsSubmitting,
    company_pk,
    productId,
    onFieldChange,
    setIsLoading,
    setEmissions,
}) => {
    return (
        /* Add/Edit Emission Modal */
        <Dialog
            open={isModalOpen}
            as="div"
            className="fixed inset-0 z-20 pt-12 overflow-y-auto"
            onClose={() => Helpers.handleCloseModal(setIsModalOpen, setCurrentEmission)}
            aria-labelledby="emission-modal-title"
        >
            <div className="min-h-screen px-4 text-center">
                {/* Static backdrop */}
                <div className="fixed inset-0 bg-black/50" />

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
                            <X className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/*  Energy Consumption Section */}
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
                                onChange={e => setFormData({ ...formData, energy_consumption: e.target.value })}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                aria-describedby="energy-consumption-help"
                            />
                            <span id="energy-consumption-help" className="sr-only">
                                Enter the energy consumption in kilowatt hours
                            </span>
                        </div>

                        {/* Reference Section */}
                        <ReferenceSection
                            formData={formData}
                            setFormData={setFormData}
                            references={references}
                            referenceQuery={referenceQuery}
                            setReferenceQuery={setReferenceQuery}
                        />


                        {/* BOM Line Items Section */}
                        <BomLineItemsSection
                            formData={formData}
                            setFormData={setFormData}
                            bomLineItems={bomLineItems}
                            bomLineItemQuery={bomLineItemQuery}
                            setBomLineItemQuery={setBomLineItemQuery}
                        />


                        {/* Override Factors Section */}
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
                                        <X className="w-4 h-4" aria-hidden="true" />
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
                                                        aria-hidden="true" />
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
                                                    <Info className="w-4 h-4 text-gray-400" />
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
                                                    <Info className="w-4 h-4 text-gray-400" />
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

                    {/* Modal Actions */}
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
    );
};

export default AddEditModal;
