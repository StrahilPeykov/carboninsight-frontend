"use client";

import React from "react";
import { Input } from "@headlessui/react";
import { CircleHelp } from "lucide-react";

export interface TextFieldProps {
  name: string;
  label: string;
  value: string;
  placeholder: string;
  tooltip: string;
  required: boolean;
  error?: string;
  onFieldChange: (val: string) => void;
}

export default function TextField({
  name,
  label,
  value,
  placeholder,
  tooltip,
  error,
  required,
  onFieldChange,
}: TextFieldProps) {
  // keep the tooltip styling here
  const tooltipBaseClass =
    "absolute left-full ml-2 top-1/2 transform -translate-y-1/2 " +
    "w-max max-w-xs px-3 py-1.5 text-xs text-white bg-gray-800 rounded-md " +
    "shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10";

  return (
    <div className="space-y-1">
      <div className="flex items-center mb-1">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tooltip && (
          <div className="relative group ml-2">
            <CircleHelp className="h-4 w-4 text-gray-400 cursor-pointer" />
            <span className={tooltipBaseClass}>{tooltip}</span>
          </div>
        )}
      </div>
      <Input
        id={name}
        name={name}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onFieldChange(e.target.value)}
        className={`mt-1 block w-full rounded-md border ${
          error ? "border-red-500" : "border-gray-300"
        } px-3 py-2 focus:ring-green-500 focus:border-green-500 data-[focus]:border-green-500 data-[focus]:ring-green-500`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
