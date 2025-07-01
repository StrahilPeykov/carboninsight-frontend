"use client";

// Import necessary React and UI components
import React from "react";
import { Info, X } from "lucide-react";
import { Tooltip } from "../components/ToolTip";
// Import helpers and type definitions
import * as Helpers from "./OverrideHelpers";
import { LifecycleStageChoice } from "@/lib/api";
import DropdownFieldGeneric from "./DropDownFieldGeneric";
import { OverrideFactor } from "@/lib/api";
import { FieldKey } from "../product-info/types";

// Type definition for form data that includes override factors
export type FormDataWithOverrideFactors = {
  override_factors: OverrideFactor[];
  [key: string]: any; // allows any other fields
};

// Props interface for the OverrideModal component
type OverrideModalProps = {
  // Form data containing override factors and other fields
  formData: FormDataWithOverrideFactors;
  // Function to update the form data state
  setFormData: (data: FormDataWithOverrideFactors) => void;
  // Available lifecycle stages for dropdown selection
  lifecycleChoices: LifecycleStageChoice[];
  // Controls visibility of the modal
  isModalOpen: boolean;
  // Function to toggle modal visibility
  setIsModalOpen: (isOpen: boolean) => void;
  // Optional callback for field changes
  onFieldChange: (data: OverrideFactor[]) => void;
  // Function to render custom form fields
  renderField: (fieldKey: FieldKey) => React.JSX.Element;
};

// Main component for managing emission override factors in the carbon accounting system.
// This component provides a flexible interface for users to define custom emission factors
// across different lifecycle stages, enabling more accurate carbon footprint calculations
// when standard reference values aren't appropriate. It supports both biogenic and non-biogenic
// CO2 emission factor overrides with appropriate tooltips explaining the IPCC methodologies.
export default function OverrideModal({
  formData,
  setFormData,
  lifecycleChoices,
  onFieldChange,
  renderField,
}: OverrideModalProps) {
  // ── Filter options based on query ──────────────────────────────
  return (
    <>
      {/* Render PCF calculation method field */}
      {renderField("pcf_calculation_method")}
      <div>
        {/* Header section with title and add button */}
        <div className="flex justify-between items-center mb-2 pt-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Override Emissions
          </label>
          <button
            type="button"
            onClick={() => Helpers.handleAddOverrideFactor(setFormData, formData)}
            className="text-sm text-red hover:text-red-800"
          >
            + Add Override
          </button>
        </div>

        {/* Map and render each override factor */}
        {formData.override_factors.map((factor, index) => (
          <div
            key={index}
            className="mb-4 border p-3 rounded-lg dark:border-gray-700 relative"
          >
            {/* Remove button for this override factor */}
            <button
              type="button"
              onClick={() => Helpers.handleRemoveOverrideFactor(formData, setFormData, index)}
              className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              aria-label="Remove override"
              style={{ zIndex: 10 }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Lifecycle Stage Combobox */}
            <div className="relative mb-3">
              <DropdownFieldGeneric
                name={`lifecycle_stage_${index}`}
                label="Lifecycle Stage"
                value={factor.lifecycle_stage || ""}
                options={lifecycleChoices}
                // Handle selection of lifecycle stage
                onFieldChange={(value: string) => {
                  Helpers.handleOverrideFactorChange(
                    formData,
                    setFormData,
                    index,
                    "lifecycle_stage",
                    value
                  );
                  onFieldChange(formData.override_factors);
                }}
                placeholder="Select lifecycle stage"
                required={true}
              ></DropdownFieldGeneric>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Biogenic CO2 Field */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Impact (biogenic) kg CO₂-eq
                  <Tooltip
                    content={
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>LCIA method: IPCC 2021 (incl. biogenic CO2)</div>
                        <div>Impact category: climate change: biogenic (incl. CO2)</div>
                        <div>Indicator: GWP100</div>
                      </div>
                    }
                  >
                    <Info className="w-4 h-4 text-gray-400" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  min="0"
                  // Format the value to handle both numbers and empty fields
                  value={
                    Number.isFinite(factor.co_2_emission_factor_biogenic)
                      ? factor.co_2_emission_factor_biogenic
                      : ""
                  }
                  // Update biogenic emission factor on change
                  onChange={e => {
                    // Update the biogenic emission factor in the form data
                    // Parameters:
                    // - formData: Current form state containing all override factors
                    // - setFormData: State setter function to update form data
                    // - index: Position of this override factor in the array
                    // - "biogenic": Field identifier for the biogenic emission factor
                    // - e.target.value: New value from the input element
                    Helpers.handleOverrideFactorChange(
                      formData,
                      setFormData,
                      index,
                      "biogenic",
                      e.target.value
                    );
                    // Notify parent component about the change to enable further processing
                    // (like validation, calculations, or API updates)
                    onFieldChange(formData.override_factors);
                  }}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              {/* Non-Biogenic CO2 Field */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Impact (non-biogenic) kg CO₂-eq
                  <Tooltip
                    content={
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>LCIA method: IPCC 2021</div>
                        <div>
                          Impact category: climate change: total (excl. biogenic CO2, incl.
                          SLCFs)
                        </div>
                        <div>Indicator: GWP100</div>
                      </div>
                    }
                  >
                    <Info className="w-4 h-4 text-gray-400" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  min="0"
                  // Format the value to handle both numbers and empty fields
                  value={
                    Number.isFinite(factor.co_2_emission_factor_non_biogenic)
                      ? factor.co_2_emission_factor_non_biogenic
                      : ""
                  }
                  // Update non-biogenic emission factor on change
                  onChange={e => {
                    Helpers.handleOverrideFactorChange(
                      formData,
                      setFormData,
                      index,
                      "non_biogenic",
                      e.target.value
                    );
                    onFieldChange(formData.override_factors);
                  }}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
