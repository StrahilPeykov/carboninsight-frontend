// Client-side component for production energy emission data management
// Enables create, read, update operations for energy consumption records
"use client";

// Core React library for component architecture and hooks
/* Imports */
import React from "react";
// Headless UI components for accessible modal and combobox interactions
// Dialog provides modal foundation with proper focus management and ARIA support
// Combobox enables searchable dropdown with keyboard navigation and screen reader compatibility
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
// Lucide React icons for consistent visual interface elements
// Info icon provides contextual help tooltips for complex form fields
// X icon enables modal closure with clear visual affordance
// ChevronDown indicates dropdown functionality and state
import { Info, X, ChevronDown } from "lucide-react";
// Custom button component with consistent styling and interaction patterns
import Button from "@/app/components/ui/Button";
// Tooltip component for providing contextual help and field explanations
// Critical for explaining complex emission factor calculations and methodologies
import { Tooltip } from "../components/ToolTip";

// API type definitions for production energy emission data structures
// ProductionEnergyEmission represents the core data model for energy consumption records
import { ProductionEnergyEmission } from "@/lib/api/productionEmissionApi";
// EmissionReference provides standardized emission factors for calculations
// Used as lookup data for accurate carbon footprint computations
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
// LineItem represents bill of materials components that consume energy
// Links production processes to specific material inputs
import { LineItem } from "@/lib/api/bomApi";

// Local module imports for business logic and data management
// API calls module encapsulates server communication and error handling
import * as apiCalls from "./api-calls";
// Helpers module provides utility functions for form manipulation and validation
import * as Helpers from "./helpers";
// Types module defines local interfaces and constants for component state management
// FormData interface ensures type safety across form operations
// lifecycleOptions provides predefined lifecycle stage selections
import { FormData, lifecycleOptions } from "./types";
// BomLineItemsSection handles the selection and management of bill of materials
// Enables linking energy consumption to specific production components
import BomLineItemsSection from "./BomLineItemsSection";
// ReferenceSection manages emission factor selection and override capabilities
// Provides interface for choosing appropriate carbon intensity factors
import ReferenceSection from "./ReferenceSection";

// Comprehensive props interface for AddEditModal component
// Extends functionality from OverrideFactorsModal with additional state management
// Supports both creation and editing workflows for production energy emissions
// Implements controlled component pattern for predictable state management
/* Prop types for AddEditModal, extending off from OverrideFactorsModal */
type AddEditModalProps = {
    // Modal visibility and interaction control
    // isModalOpen determines whether the modal dialog is currently displayed
    // setIsModalOpen provides callback for opening/closing modal from parent components
    /* modal control */
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

    // Current emission record being edited or null for new records
    // currentEmission holds the complete data structure for existing records
    // setCurrentEmission enables switching between edit and create modes
    // Null value indicates creation mode, non-null indicates edit mode
    /* emission being edited */
    currentEmission: ProductionEnergyEmission | null;
    setCurrentEmission: React.Dispatch<
        React.SetStateAction<ProductionEnergyEmission | null>
    >;

    // Form data state management for controlled inputs
    // formData contains all user inputs in a structured format
    // setFormData enables real-time form updates and validation
    // Ensures data consistency and enables form state persistence
    /* form state */
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;

    // Reference data for emission factor lookups and calculations
    // references array contains available emission factors from database
    // referenceQuery enables search/filter functionality within references
    // setReferenceQuery updates search state for real-time filtering
    /* reference list */
    references: EmissionReference[];
    referenceQuery: string;
    setReferenceQuery: React.Dispatch<React.SetStateAction<string>>;

    // Bill of Materials (BOM) line items for production process linking
    // bomLineItems provides available components that consume energy
    // bomLineItemQuery enables search functionality within BOM items
    // setBomLineItemQuery updates search state for component selection
    /* BOM items */
    bomLineItems: LineItem[];
    bomLineItemQuery: string;
    setBomLineItemQuery: React.Dispatch<React.SetStateAction<string>>;

    // Lifecycle stage search functionality for override factors
    // query represents current search input for lifecycle stage selection
    // setQuery updates search state for filtering lifecycle options
    // Enables users to quickly find relevant lifecycle stages
    /* lifecycle search */
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;

    // Form submission state management for user feedback
    // isSubmitting indicates whether API call is currently in progress
    // setIsSubmitting controls loading states and prevents double-submission
    // Essential for providing clear feedback during async operations
    /* submit state */
    isSubmitting: boolean;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;

    // Parent component integration and callback functions
    // company_pk identifies the company context for data operations
    // productId function provides dynamic product identifier for API calls
    // onFieldChange callback notifies parent of form modifications
    // setIsLoading controls parent loading states during operations
    // setEmissions updates parent component's emission list after successful operations
    /* parent helpers */
    company_pk: number;
    productId: () => number;
    onFieldChange: () => void;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setEmissions: React.Dispatch<
        React.SetStateAction<ProductionEnergyEmission[]>
    >;
};

// Main AddEditModal functional component with comprehensive prop destructuring
// Implements React.FC pattern for type safety and clear component contracts
// Handles both creation and editing workflows based on currentEmission state
// Provides accessible modal interface for production energy data management
/* Component */
const AddEditModal: React.FC<AddEditModalProps> = ({
    // Modal state management props for visibility control
    isModalOpen,
    setIsModalOpen,
    // Current record being edited (null for new records)
    currentEmission,
    setCurrentEmission,
    // Form data state for controlled input management
    formData,
    setFormData,
    // Reference data and search functionality for emission factors
    references,
    referenceQuery,
    setReferenceQuery,
    // Bill of Materials data and search functionality
    bomLineItems,
    bomLineItemQuery,
    setBomLineItemQuery,
    // Lifecycle stage search functionality
    query,
    setQuery,
    // Submission state for loading indicators and user feedback
    isSubmitting,
    setIsSubmitting,
    // Parent component integration callbacks and identifiers
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
