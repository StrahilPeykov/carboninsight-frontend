export type FieldKey = keyof FieldValues;
export type FieldErrors = Record<FieldKey, string>;
type FieldPlaceholders = Partial<Record<FieldKey, string>>;
type FieldTooltips = FieldErrors;
type FieldTypes = FieldErrors;
type FieldTitles = FieldErrors;
type requiredFields = Record<FieldKey, boolean>;
import { OverrideFactor } from "@/lib/api";

//──────────────────────────────────────────────────────────────────────
//Product Form Field Configuration
//
//This module defines all metadata related to the product info form fields.
//It includes:
//- `FieldValues`: The shape of the form state
//- `FieldKey`, `FieldErrors`: Helper types for managing field keys/errors
//- `placeholderTexts`, `tooltipTexts`: UI helpers for form fields
//- `fieldTypes`: Indicates how each field should be rendered
//- `fieldTitles`: Human-readable labels for UI rendering
//- `requiredFields`: Which fields are mandatory for submission
//
//Used in:
//- Product Info Tab (e.g., creation/editing forms for products)
//
//This centralization allows dynamic rendering of forms and consistent
//validation, placeholders, and tooltips.
//──────────────────────────────────────────────────────────────────────


// ── Field definitions and types ──
export interface FieldValues {
  name: string;
  description: string;
  manufacturer_name: string;
  manufacturer_country: string;
  manufacturer_city: string;
  manufacturer_street: string;
  manufacturer_zip_code: string;
  year_of_construction: string;
  family: string;
  sku: string;
  reference_impact_unit: string;
  pcf_calculation_method: string;
  is_public: boolean;
  override_factors: OverrideFactor[]; // Optional, for product overrides
}

// ── Field rendering helpers (placeholders, tooltips, etc.) ──
export const placeholderTexts: FieldPlaceholders = {
  name: "iPhone 5s",
  description: "A mobile phone.",
  manufacturer_name: "Apple Inc.",
  manufacturer_country: "Select country",
  manufacturer_city: "Kabul",
  manufacturer_street: "Main Street 1",
  manufacturer_zip_code: "1001",
  year_of_construction: "1900",
  family: "Electronics",
  sku: "1337",
  reference_impact_unit: "Select unit",
  pcf_calculation_method: "Select method",
};

export const tooltipTexts: FieldTooltips = {
  name: "Full product name (required).",
  description: "Product description (required).",
  manufacturer_name: "Manufacturer name (required).",
  manufacturer_country: "Select country of manufacturer (required).",
  manufacturer_city: "City of manufacturer (required).",
  manufacturer_street: "Street address of manufacturer (required).",
  manufacturer_zip_code: "ZIP code of manufacturer (required).",
  year_of_construction: "Year this product was constructed (required).",
  family: "Product family or category (required).",
  sku: "Stock Keeping Unit (required).",
  reference_impact_unit: "Unit for impact reference, e.g. g (required).",
  pcf_calculation_method: "Calculation method, e.g. EN 15804 (required).",
  is_public: "Is this product publicly listed?",
  override_factors: "Override factors for emissions (optional).",
};

export const fieldTypes: FieldTypes = {
  name: "text",
  description: "textarea",
  manufacturer_name: "text",
  manufacturer_country: "dropdown",
  manufacturer_city: "text",
  manufacturer_street: "text",
  manufacturer_zip_code: "text",
  year_of_construction: "text",
  family: "text",
  sku: "text",
  reference_impact_unit: "dropdown",
  pcf_calculation_method: "dropdown",
  is_public: "radio",
  override_factors: "override-factors-modal", // Custom type for override factors
};

export const fieldTitles: FieldTitles = {
  name: "Product Name",
  description: "Product Description",
  manufacturer_name: "Manufacturer Name",
  manufacturer_country: "Manufacturer Country",
  manufacturer_city: "Manufacturer City",
  manufacturer_street: "Manufacturer Street",
  manufacturer_zip_code: "Manufacturer ZIP Code",
  year_of_construction: "Year of Construction",
  family: "Family",
  sku: "SKU",
  reference_impact_unit: "Reference Impact Unit",
  pcf_calculation_method: "PCF Calculation Method",
  is_public: "Publicly Listed?",
  override_factors: "Override Factors",
};

export const requiredFields: requiredFields = {
  name: true,
  description: true,
  manufacturer_name: true,
  manufacturer_country: true,
  manufacturer_city: true,
  manufacturer_street: true,
  manufacturer_zip_code: true,
  year_of_construction: true,
  family: true,
  sku: true,
  reference_impact_unit: true,
  pcf_calculation_method: true,
  is_public: true,
  override_factors: false, // Optional for product overrides
};
