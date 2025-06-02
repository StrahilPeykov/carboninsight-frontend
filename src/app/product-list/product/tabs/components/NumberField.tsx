"use client";

import React from "react";
import { Input } from "@headlessui/react";
import { CircleHelp } from "lucide-react";

export interface NumberFieldProps {
  name: string;
  label: string;
  value: string; // <-- change to string
  placeholder: string;
  tooltip?: string;
  required: boolean;
  error?: string;
  step?: number;
  min?: number;
  max?: number;
  onFieldChange: (val: string) => void; // <-- change to string
}

export default function NumberField({
  name,
  label,
  value,
  placeholder,
  tooltip,
  error,
  required,
  step = 0.1,
  min,
  max,
  onFieldChange,
}: NumberFieldProps) {
  const tooltipBaseClass =
    "absolute left-full ml-2 top-1/2 transform -translate-y-1/2 " +
    "w-max max-w-xs px-3 py-1.5 text-xs text-white bg-gray-800 rounded-md " +
    "shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10";

  return (
    <div className="space-y-1">
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

      <Input
        id={name}
        name={name}
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        onChange={e => onFieldChange(e.target.value)}
        className={`
          h-10 mt-1 block w-full rounded-md
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          border ${
            error
              ? "border-red-500 dark:border-red-400"
              : "border-gray-300 dark:border-gray-600"
          }
          px-3 focus:ring-green-500 focus:border-green-500
          data-[focus]:border-green-500 data-[focus]:ring-green-500
        `}
      />

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
