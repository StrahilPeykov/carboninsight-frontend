"use client";

import React from "react";
import { Field, Label, Textarea } from "@headlessui/react";
import { CircleHelp } from "lucide-react";

export interface TextareaFieldProps {
  name: string;
  label: string;
  tooltip?: string;
  value: string;
  placeholder: string;
  required: boolean;
  error?: string;
  onFieldChange: (val: string) => void;
}

export default function TextareaField({
  name,
  label,
  tooltip,
  value,
  placeholder = "",
  required,
  error,
  onFieldChange,
}: TextareaFieldProps) {
  const tooltipBaseClass =
    "absolute left-full ml-2 top-1/2 transform -translate-y-1/2 " +
    "w-max max-w-xs px-3 py-1.5 text-xs text-white bg-gray-800 rounded-md " +
    "shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10";

  return (
    <Field>
      <div className="flex items-center mb-1">
        <Label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {tooltip && (
          <div className="relative group ml-2">
            <CircleHelp className="h-4 w-4 text-gray-400 cursor-pointer" />
            <span className={tooltipBaseClass}>{tooltip}</span>
          </div>
        )}
      </div>

      <Textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={e => onFieldChange(e.target.value)}
        className={`block w-full rounded-md border ${
          error ? "border-red-500" : "border-gray-300"
        } px-3 py-2 focus:ring-green-500 focus:border-green-500`}
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </Field>
  );
}
