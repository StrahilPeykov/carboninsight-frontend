"use client";

import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import { LineItem } from "@/lib/api/bomApi";
import { FormData } from "./types";
import OverrideFactorsList from "./OverrideFactorsList";

interface UserEnergyFormProps {
  formData: FormData;
  setFormData: (formData: FormData) => void;
  references: EmissionReference[];
  bomLineItems: LineItem[];
}

export default function UserEnergyForm({
  formData,
  setFormData,
  references,
  bomLineItems,
}: UserEnergyFormProps) {
  const [referenceQuery, setReferenceQuery] = useState("");
  const [bomLineItemQuery, setBomLineItemQuery] = useState("");

  return (
    <div className="space-y-4">
      {/* Energy Consumption Section */}
      <div>
        <label
          htmlFor="user_energy_consumption"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Energy Consumption (kWh) *
        </label>
        <input
          type="number"
          id="user_energy_consumption"
          min="0"
          step="0.01"
          value={formData.energy_consumption}
          onChange={e => setFormData({ ...formData, energy_consumption: e.target.value })}
          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          aria-describedby="user-energy-consumption-help"
        />
        <span id="user-energy-consumption-help" className="sr-only">
          Enter the energy consumption during product usage in kilowatt hours
        </span>
      </div>

      {/* Reference Section */}
      <div>
        <label
          htmlFor="user-energy-reference-select"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Reference Emission Factor
        </label>
        <div className="relative">
          <Combobox
            value={
              formData.reference
                ? references.find(ref => ref.id.toString() === formData.reference)?.name || ""
                : ""
            }
            onChange={(value: string | null) => {
              if (!value) {
                setFormData({ ...formData, reference: "" });
                return;
              }
              const selected = references.find(ref => ref.name === value);
              setFormData({
                ...formData,
                reference: selected ? selected.id.toString() : "",
              });
            }}
          >
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
              <ComboboxInput
                id="user-energy-reference-select"
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                displayValue={(value: string) => value}
                onChange={event => setReferenceQuery(event.target.value)}
                placeholder="Select a reference"
                aria-describedby="user-energy-reference-help"
              />
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </ComboboxButton>
            </div>
            <span id="user-energy-reference-help" className="sr-only">
              Select an emission reference database for user energy calculations
            </span>
            <div className="relative w-full">
              <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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

      {/* BOM Line Items Section */}
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
                    <X className="w-3 h-3" aria-hidden="true" />
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
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-left">
              <ComboboxInput
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-white dark:bg-gray-700"
                displayValue={() => bomLineItemQuery}
                onChange={event => setBomLineItemQuery(event.target.value)}
                placeholder="Select BOM items to associate"
                aria-describedby="user-energy-bom-items-help"
              />
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </ComboboxButton>
            </div>
            <span id="user-energy-bom-items-help" className="sr-only">
              Select bill of materials items to associate with this user energy emission
            </span>
            <div className="relative w-full">
              <ComboboxOptions className="absolute z-[200] max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {bomLineItems.length === 0 ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                    No BOM items available. Add items in the Bill of Materials tab first.
                  </div>
                ) : bomLineItems.filter(
                    item =>
                      !formData.line_items.includes(item.id) &&
                      (bomLineItemQuery === "" ||
                        item.line_item_product.name
                          .toLowerCase()
                          .includes(bomLineItemQuery.toLowerCase()))
                  ).length === 0 ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
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

      {/* Override Factors Section */}
      <OverrideFactorsList formData={formData} setFormData={setFormData} />
    </div>
  );
}
