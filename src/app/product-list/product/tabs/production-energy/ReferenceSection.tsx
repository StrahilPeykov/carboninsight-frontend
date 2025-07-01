"use client";

import React from "react";
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from "@headlessui/react";
import { ChevronDown } from "lucide-react";

import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import { FormData } from "./types";

/**
 * Dropdown section that lets a user choose an emission reference
 * from a provided list. Extracted from AddEditModal for clarity
 * and re‑use.
 */
export type ReferenceSectionProps = {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    references: EmissionReference[];
    referenceQuery: string;
    setReferenceQuery: React.Dispatch<React.SetStateAction<string>>;
};

const ReferenceSection: React.FC<ReferenceSectionProps> = ({
    formData,
    setFormData,
    references,
    referenceQuery,
    setReferenceQuery,
}) => {
    /**
     * Currently‑selected reference name (empty string if none).
     */
    const currentName = formData.reference
        ? references.find((ref) => ref.id.toString() === formData.reference)?.name || ""
        : "";

    /**
     * Apply the combobox selection back to the form.
     */
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
