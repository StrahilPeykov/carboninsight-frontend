"use client";

import React, { useState } from "react";
import { X, ChevronDown, Info } from "lucide-react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Tooltip } from "../components/ToolTip";
import { FormData, lifecycleOptions } from "./types";
import * as Helpers from "./helpers";

interface OverrideFactorsListProps {
  formData: FormData;
  setFormData: (formData: FormData) => void;
}

export default function OverrideFactorsList({ formData, setFormData }: OverrideFactorsListProps) {
  const [query, setQuery] = useState("");

  return (
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
          + Add override
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
            className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`Remove override factor ${index + 1}`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lifecycle Stage
          </label>
          <div className="relative mb-3">
            <Combobox
              value={
                (factor.lifecycle_stage
                  ? lifecycleOptions.find(opt => opt.startsWith(factor.lifecycle_stage ?? ""))
                  : "") ?? ""
              }
              onChange={value => {
                const enumValue = Helpers.getLifecycleEnumValue(value);
                Helpers.handleOverrideFactorChange(formData, setFormData, index, "name", enumValue);
              }}
            >
              <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
                <ComboboxInput
                  className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                  displayValue={(value: string | null) => value || ""}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Select lifecycle stage"
                  aria-label={`Lifecycle stage for override factor ${index + 1}`}
                />
                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </ComboboxButton>
              </div>
              <div className="relative w-full">
                <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {lifecycleOptions.filter(
                    option =>
                      query === "" || option.toLowerCase().includes(query.toLowerCase())
                  ).length === 0 ? (
                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                      No matching lifecycle stages found.
                    </div>
                  ) : (
                    lifecycleOptions
                      .filter(
                        option =>
                          query === "" || option.toLowerCase().includes(query.toLowerCase())
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
                id={`user-energy-biogenic-factor-${index}`}
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
                aria-label={`Biogenic CO2 emission factor for user energy override ${index + 1}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Impact (non-biogenic) kg CO₂-eq
                <Tooltip
                  content={
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div>LCIA method: IPCC 2021</div>
                      <div>
                        Impact category: climate change: total (excl. biogenic CO2, incl. SLCFs)
                      </div>
                      <div>Indicator: GWP100</div>
                    </div>
                  }
                >
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </label>
              <input
                id={`user-energy-non-biogenic-factor-${index}`}
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
                aria-label={`Non-biogenic CO2 emission factor for user energy override ${index + 1}`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
