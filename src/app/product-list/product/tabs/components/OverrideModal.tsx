"use client";

import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { DataPassedToTabs, TabHandle } from "../../page";
import { TransportEmission } from "@/lib/api/transportEmissionApi";
import { LineItem } from "@/lib/api/bomApi";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
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
import * as Helpers from "./OverrideHelpers";
import { LifecycleStageChoice } from "@/lib/api";
import DropdownFieldGeneric from "./DropDownFieldGeneric";
import { OverrideFactor } from "@/lib/api";
import { FieldKey } from "../product-info/types";

// type OverrideModalProps<T extends { override_factors: OverrideFactor[] }> = {
//     formData: T;
//     setFormData: (a: T) => void
//     lifecycleChoices: LifecycleChoice[];
// };

export type FormDataWithOverrideFactors = {
  override_factors: OverrideFactor[];
  [key: string]: any; // allows any other fields
};

type OverrideModalProps = {
  formData: FormDataWithOverrideFactors;
  setFormData: (data: FormDataWithOverrideFactors) => void;
  lifecycleChoices: LifecycleStageChoice[];
  onFieldChange: (data: OverrideFactor[]) => void; // Optional callback for field changes
  renderField: (fieldKey: FieldKey) => React.JSX.Element;
};

// export default function OverrideModal<T extends { override_factors: OverrideFactor[] }>({
//     formData,
//     setFormData,
//     lifecycleChoices,
// }: OverrideModalProps<T>) {

export default function OverrideModal({
  formData,
  setFormData,
  lifecycleChoices,
  onFieldChange,
  renderField,
}: OverrideModalProps) {
  // Modal open state
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("OverrideModal formData");

  // ── Filter options based on query ──────────────────────────────
  return (
    <>
      <div className="mt-6">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
          variant={formData.override_factors.length === 0 ? "primary" : "outline"}
        >
          {formData.override_factors.length === 0 ? (
            <>
              <Plus className="w-4 h-4" /> Add product emissions override
            </>
          ) : (
            <>
              Edit {formData.override_factors.length} emissions
            </>
          )}
        </Button>
      </div>
      <Dialog
        open={isModalOpen}
        as="div"
        className="fixed inset-0 overflow-y-auto pt-12 z-20"
        onClose={() => setIsModalOpen(false)}
      >
        <div className="min-h-screen px-4 text-center">
          <div className="fixed inset-0 bg-black/50" />
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <DialogPanel className="relative inline-block w-full max-w-lg p-6 my-8 overflow-visible text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
            <div className="flex justify-between items-center mb-4">
              <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
                Override product emissions
              </DialogTitle>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderField("pcf_calculation_method")}
            <div>
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

              {formData.override_factors.map((factor, index) => (
                <div
                  key={index}
                  className="mb-4 border p-3 rounded-lg dark:border-gray-700 relative"
                >
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
                        value={
                          Number.isFinite(factor.co_2_emission_factor_biogenic)
                            ? factor.co_2_emission_factor_biogenic
                            : ""
                        }
                        onChange={e => {
                          Helpers.handleOverrideFactorChange(
                            formData,
                            setFormData,
                            index,
                            "biogenic",
                            e.target.value
                          );
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
                        value={
                          Number.isFinite(factor.co_2_emission_factor_non_biogenic)
                            ? factor.co_2_emission_factor_non_biogenic
                            : ""
                        }
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
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
