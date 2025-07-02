import {
  FieldErrors,
  FieldKey,
  FieldValues,
} from "@/app/product-list/product/tabs/product-info/types";
import React from "react";

// ─────────────────────────────────────────────────────────────
// Handle input field changes in the product info form
// Updates field values, validates required fields, and triggers change callback
// ─────────────────────────────────────────────────────────────
// ── Handle field value changes ──
export const handleFieldChange = <K extends FieldKey>(
  name: K,
  value: FieldValues[K],
  setFieldValues: React.Dispatch<React.SetStateAction<FieldValues>>,
  setFieldErrors: React.Dispatch<React.SetStateAction<FieldErrors>>,
  onFieldChange: () => void
): void => {
  // Update local state with new field value
  setFieldValues((d: FieldValues) => ({
    ...d,
    [name]: value,
  }));
  // Clear or set validation error for the modified field
  setFieldErrors((e: FieldErrors) => ({
    ...e,
    [name]: value === "" || value === null || value === undefined ? "Please enter the value" : "",
  }));
  // Notify parent that a field has changed (used to mark tab as dirty)
  onFieldChange();
};
