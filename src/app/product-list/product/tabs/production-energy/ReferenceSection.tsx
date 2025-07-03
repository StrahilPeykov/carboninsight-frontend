// Client-side component for emission reference selection and management
// Provides searchable dropdown interface for choosing standardized emission factors
// Critical for accurate carbon footprint calculations based on recognized databases
"use client";

// React library for component architecture and state management
import React from "react";
// Headless UI combobox components for accessible searchable dropdown functionality
// Provides keyboard navigation, screen reader support, and WAI-ARIA compliance
// ComboboxInput enables searchable text input with real-time filtering capabilities
// ComboboxOptions creates accessible dropdown list with proper focus management
// ComboboxButton provides visual affordance for dropdown interaction and state indication
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from "@headlessui/react";
// Lucide icon for visual interface elements
// ChevronDown indicates dropdown functionality and collapsed/expanded state
import { ChevronDown } from "lucide-react";
// API type definition for emission reference data structure
// EmissionReference represents standardized carbon intensity factors from recognized databases
// Contains emission factors, methodologies, and metadata for lifecycle assessments
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
// Local form data type definition for component state management
// FormData interface ensures type safety across production energy form operations
import { FormData } from "./types";

// TypeScript interface defining props contract for ReferenceSection component
// Implements controlled component pattern for predictable state management
// Extracted from AddEditModal for modularity, reusability, and separation of concerns
// Enables standardized emission reference selection across multiple form contexts

export type ReferenceSectionProps = {
    // Form data containing selected reference ID and other emission data
    // Follows controlled component pattern for consistent state management
    formData: FormData;
    // State setter for updating form data when reference selection changes
    // Enables real-time updates to parent component's form state
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    // Complete list of available emission references for selection
    // Provides standardized carbon intensity factors from recognized databases
    references: EmissionReference[];
    // Current search query for filtering emission references in real-time
    // Enables users to quickly locate specific databases or methodologies
    referenceQuery: string;
    // State setter for updating the search query as user types
    // Triggers re-filtering of available references for improved UX
    setReferenceQuery: React.Dispatch<React.SetStateAction<string>>;
};

// ReferenceSection functional component with comprehensive prop destructuring
// Manages emission reference selection with searchable dropdown interface
// Provides access to standardized carbon intensity factors for accurate calculations
// Essential for linking energy consumption to recognized emission databases
const ReferenceSection: React.FC<ReferenceSectionProps> = ({
    // Current form state containing selected reference ID
    formData,
    // Function to update form state when reference selection changes
    setFormData,
    // Available emission references for dropdown selection
    references,
    // Current search query for filtering references
    referenceQuery,
    // Function to update search query for real-time filtering
    setReferenceQuery,
}) => {
    // Computed display name for currently selected reference
    // Resolves reference ID to human-readable name for UI display
    // Returns empty string if no reference is selected or reference not found
    // Critical for maintaining sync between form state and visual representation
    const currentName = formData.reference
        ? references.find((ref) => ref.id.toString() === formData.reference)?.name || ""
        : "";

    // Handler function for processing reference selection changes
    // Converts display name back to reference ID for form state storage
    // Implements null-safe selection handling and form state synchronization
    // Ensures data consistency between UI selection and backend requirements
    const handleChange = (value: string | null) => {
        if (!value) {
            setFormData((prev) => ({ ...prev, reference: "" }));
            return;
        }
        const selected = references.find((ref) => ref.name === value);
        setFormData((prev) => ({
            ...prev,
            reference: selected ? selected.id.toString() : "",
        }));
    };

    // Computed filtered references list for dropdown display
    // Applies case-insensitive search filtering on reference names
    // Enables real-time search functionality for improved user experience
    // Reduces cognitive load when selecting from large reference databases
    const filtered = references.filter(
        (ref) =>
            referenceQuery === "" ||
            ref.name.toLowerCase().includes(referenceQuery.toLowerCase())
    );

    return (
        <div>
            <label htmlFor="reference-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reference
            </label>

            <div className="relative">
                <Combobox value={currentName} onChange={handleChange}>
                    {/* Input */}
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                        <ComboboxInput
                            id="reference-select"
                            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                            displayValue={(value: string) => value}
                            onChange={(event) => setReferenceQuery(event.target.value)}
                            placeholder="Select a reference"
                            aria-describedby="reference-help"
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </ComboboxButton>
                    </div>

                    <span id="reference-help" className="sr-only">
                        Select an emission reference database for calculations
                    </span>

                    {/* Options */}
                    <div className="relative w-full">
                        <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filtered.map((ref) => (
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
    );
};

export default ReferenceSection;
