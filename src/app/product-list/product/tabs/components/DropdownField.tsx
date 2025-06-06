"use client";

import React, { useState, useEffect } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CircleHelp, ChevronDown, Loader2 } from "lucide-react";

// ── Dropdown option interface ───────────────────────────────────────────────
export interface DropdownOption {
  value: string;
  display_name: string;
}

// ── Props for DropdownField component ──────────────────────────────────────
export interface DropdownFieldProps {
  name: string;
  label: string;
  value: string; // This is a string
  tooltip?: string;
  required: boolean;
  error?: string;
  placeholder?: string;
  apiUrl: string;
  companyId: string;
  onFieldChange: (val: string) => void; // This expects a string
}

// ── DropdownField component ────────────────────────────────────────────────
export default function DropdownField({
  name,
  label,
  value,
  tooltip,
  required,
  error,
  placeholder = "Select an option",
  apiUrl,
  companyId,
  onFieldChange,
}: DropdownFieldProps) {
  // ── State variables ─────────────────────────────────────────────
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedOptionDisplayName, setSelectedOptionDisplayName] = useState("");
  // value stands for the selected value

  // ── Fetch options from API on mount ────────────────────────────
  useEffect(() => {
    const fetchOptions = async () => {
      if (isLoading || options.length > 0) return;
      setIsLoading(true);
      try {
        const access_token = localStorage.getItem("access_token");
        if (!access_token) {
          throw new Error("No access token found");
        }
        // Fetch OPTIONS for the products endpoint to get choices for the field
        const res = await fetch(`${apiUrl}/companies/${companyId}/products/`, {
          method: "OPTIONS",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        const choices = data.actions?.POST?.[name]?.choices;
        if (Array.isArray(choices)) {
          setOptions(choices);
        } else {
          setHasError(true);
        }
      } catch (err) {
        console.error("Error fetching options:", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  // ── Update display name when options or value changes ──────────
  useEffect(() => {
    console.log("options", options);
    setSelectedOptionDisplayName(options.find(o => o.value === value)?.display_name || "");
  }, [options, value]);

  // ── Filter options based on query ──────────────────────────────
  const filteredOptions =
    query === ""
      ? options
      : options.filter(option => option.display_name.toLowerCase().includes(query.toLowerCase()));

  // ── Tooltip styling ────────────────────────────────────────────
  const tooltipBaseClass =
    "absolute left-full ml-2 top-1/2 transform -translate-y-1/2 " +
    "w-max max-w-xs px-3 py-1.5 text-xs text-white bg-gray-800 rounded-md " +
    "shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10";

  // 1) Derive the selected object from your string `value` prop:

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-1">
      {/* ── Label and tooltip ─────────────────────────────── */}
      <div className="flex items-center mb-1">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tooltip && (
          <div className="relative group ml-2">
            <CircleHelp className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-pointer" />
            <span className={tooltipBaseClass}>{tooltip}</span>
          </div>
        )}
      </div>

      {/* ── Loading state ─────────────────────────────────── */}
      {isLoading ? (
        <div
          className="
            relative w-full cursor-default overflow-hidden rounded-md
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            text-left p-2 flex items-center justify-between
          "
        >
          <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          <Loader2 className="h-5 w-5 text-gray-400 dark:text-gray-500 animate-spin" />
        </div>
      ) : (
        // ── Combobox for dropdown ──────────────────────────
        <Combobox
          value={selectedOptionDisplayName}
          onChange={selectedItem => {
            onFieldChange(options.find(o => o.display_name === selectedItem)?.value || "");
            setSelectedOptionDisplayName(selectedItem || "");
          }}
          virtual={{ options: filteredOptions.map(o => o.display_name) }}
          onClose={() => setQuery("")}
        >
          <div className="relative mt-1 overflow-visible">
            <div
              className={`
                relative w-full cursor-default overflow-hidden rounded-md
                bg-white dark:bg-gray-800
                border ${error ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"}
                text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500
              `}
            >
              <ComboboxInput
                id={name}
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-gray-100 focus:ring-0"
                displayValue={(v: string) => v}
                onChange={e => setQuery(e.target.value)}
                placeholder={placeholder}
              />
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </ComboboxButton>
            </div>

            {/* ── Dropdown options ─────────────────────────── */}
            <ComboboxOptions
              className="
                absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md
                bg-white dark:bg-gray-800
                py-1 text-base dark:text-gray-100
                shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10
                focus:outline-none sm:text-sm
              "
            >
              {({ option }) => (
                <ComboboxOption
                  key={option}
                  value={option}
                  className="
                    relative cursor-default select-none w-full py-2 pl-3 pr-9
                    data-focus:bg-red-100 dark:data-focus:bg-red
                    data-hover:bg-gray-100 dark:data-hover:bg-gray-700
                    text-gray-900 dark:text-gray-100
                  "
                >
                  {option}
                </ComboboxOption>
              )}
            </ComboboxOptions>
          </div>
        </Combobox>
      )}

      {/* ── Error message ────────────────────────────────── */}
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}
