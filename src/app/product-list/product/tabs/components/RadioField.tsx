"use client";

import React from "react";
import { Field, Label, Radio, RadioGroup } from "@headlessui/react";
import { CircleHelp } from "lucide-react";

// ── Radio option interface ──────────────────────────────────────
export interface RadioOption {
  label: string;
  value: boolean;
}

// ── Props for RadioField component ──────────────────────────────
export interface RadioFieldProps {
  name: string;
  label: string;
  value: boolean;
  tooltip?: string;
  required: boolean;
  options: RadioOption[];
  error?: string;
  onFieldChange: (val: boolean) => void;
}

// ── RadioField component ────────────────────────────────────────
export default function RadioField({
  name,
  label,
  value,
  tooltip,
  required,
  options,
  error,
  onFieldChange,
}: RadioFieldProps) {
  // ── Tooltip styling ───────────────────────────────────
  const tooltipBaseClass =
    "absolute left-full ml-2 top-1/2 transform -translate-y-1/2 " +
    "w-max max-w-xs px-3 py-1.5 text-xs text-white bg-gray-800 rounded-md " +
    "shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10";

  // ── Render ────────────────────────────────────────────
  return (
    <div className="space-y-1">
      {/* ── Radio group ─────────────────────────────── */}
      <RadioGroup value={value} onChange={onFieldChange} aria-label={label}>
        {/* ── Label and tooltip ───────────────────── */}
        <div className="flex items-center mb-1">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          {tooltip && (
            <div className="relative group ml-2">
              <CircleHelp className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-pointer" />
              <span className={tooltipBaseClass}>{tooltip}</span>
            </div>
          )}
        </div>
        {/* ── Radio options ───────────────────────── */}
        <div className="flex space-x-6 mt-1">
          {options.map(option => (
            <Field key={String(option.value)} className="flex items-center gap-2">
              <Radio
                value={option.value}
                className="
                  group flex size-4 items-center justify-center rounded-full
                  border-2 border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800
                  data-[checked]:border-green-600 data-[checked]:bg-green-600
                "
              >
                <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
              </Radio>
              <Label className="text-gray-700 dark:text-gray-100 cursor-pointer">
                {option.label}
              </Label>
            </Field>
          ))}
        </div>
      </RadioGroup>

      {/* ── Error message ─────────────────────────── */}
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}
