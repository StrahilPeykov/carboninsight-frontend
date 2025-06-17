import {
  FieldErrors,
  FieldKey,
  FieldValues,
} from "@/app/product-list/product/tabs/product-info/types";
import React from "react";

// ── Handle field value changes ──
export const handleFieldChange = <K extends FieldKey>(
  name: K,
  value: FieldValues[K],
  setFieldValues: React.Dispatch<React.SetStateAction<FieldValues>>,
  setFieldErrors: React.Dispatch<React.SetStateAction<FieldErrors>>,
  onFieldChange: () => void
): void => {
  setFieldValues((d: FieldValues) => ({
    ...d,
    [name]: value,
  }));
  // clear previous error for this field, or set error if field is empty
  setFieldErrors((e: FieldErrors) => ({
    ...e,
    [name]: value === "" || value === null || value === undefined ? "Please enter the value" : "",
  }));
  onFieldChange();
};
