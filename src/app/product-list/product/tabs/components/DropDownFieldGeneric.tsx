"use client";

import React, { useState, useEffect } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CircleHelp, ChevronDown } from "lucide-react";

// ── Dropdown option interface ───────────────────────────────────────────────
export interface DropdownOption {
  value: string;
  display_name: string;
}

// ── Props for DropdownFieldGeneric component ────────────────────────────────
export interface DropdownFieldProps {
  name: string;
  label?: string; // Make label optional
  value: string;
  tooltip?: string;
  required: boolean;
  error?: string;
  placeholder?: string;
  dropdownMaxHeight?: string;
  options: DropdownOption[];
  onFieldChange: (val: string) => void;
}

// ── DropdownFieldGeneric component ──────────────────────────────────────────
export default function DropdownFieldGeneric({
  name,
  label,
  tooltip,
  required,
  value,
  error,
  placeholder = "Select an option",
  dropdownMaxHeight,
  options,
  onFieldChange,
}: DropdownFieldProps) {
  // ── State variables ─────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [selectedOptionDisplayName, setSelectedOptionDisplayName] = useState("");

  // ── Update selected display name when value or options change ──
  useEffect(() => {
    if (!value) {
      setSelectedOptionDisplayName("");
      return;
    }

    const selected = options.find(o => o.value === value);
    setSelectedOptionDisplayName(selected?.display_name || "");
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

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-1 overflow-visible">
      {/* ── Label and tooltip ─────────────────────────────── */}
      {(label || tooltip) && (
        <div className="flex items-center mb-1">
          {label && (
            <label
              htmlFor={name}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          )}
          {tooltip && (
            <div className="relative group ml-2">
              <CircleHelp className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-pointer" />
              <span className={tooltipBaseClass}>{tooltip}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Combobox for dropdown ────────────────────────── */}
      <Combobox
        value={selectedOptionDisplayName || null}
        onChange={selectedDisplayName => {
          const selected = options.find(o => o.display_name === selectedDisplayName);
          const newValue = selected?.value ?? "";
          onFieldChange(newValue);
          setSelectedOptionDisplayName(selected?.display_name || "");
        }}
        onClose={() => setQuery("")}
      >
        <div className="relative mt-1 overflow-visible">
          <div
            className={`
              relative w-full h-10 flex items-center cursor-default overflow-hidden rounded-md
              bg-white dark:bg-gray-800
              border ${
                error
                  ? "border-red-500 dark:border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              }
              text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500
            `}
          >
            <ComboboxInput
              id={name}
              className="h-10 w-full px-3 text-sm leading-none text-gray-900 dark:text-gray-100 focus:ring-0"
              displayValue={(val: string) => val || placeholder}
              onChange={event => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
            </ComboboxButton>
          </div>

          {/* ── Dropdown options ─────────────────────────── */}
          <ComboboxOptions
            className={`
              absolute z-50 mt-1 w-full overflow-auto rounded-md
              bg-white dark:bg-gray-800
              py-1 text-base text-gray-900 dark:text-gray-100
              shadow-lg ring-1 ring-black dark:ring-white ring-opacity-5 dark:ring-opacity-10
              focus:outline-none sm:text-sm ${dropdownMaxHeight || "max-h-60"}
            `}
          >
            {filteredOptions.map(option => (
              <ComboboxOption
                key={option.value}
                value={option.display_name}
                className="
                  relative cursor-default select-none w-full pl-3 pr-9
                  data-focus:bg-red-100 dark:data-focus:bg-red
                  data-hover:bg-gray-100 dark:data-hover:bg-gray-700
                  text-gray-900 dark:text-gray-100
                "
              >
                {option.display_name}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>

      {/* ── Error message ────────────────────────────────── */}
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}
