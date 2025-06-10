"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { DataPassedToTabs, TabHandle } from "../page";
import RadioField from "./components/RadioField";
import TextField from "./components/TextField";
import { Fieldset, Legend } from "@headlessui/react";
import DropdownField from "./components/DropdownField";
import TextareaField from "./components/TextareaField";

// ── ProductInfo Tab: Handles product details form and API integration ──
const ProductInfo = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId, tabKey, mode, setProductId, onFieldChange }, ref) => {
    // Expose saveTab and updateTab to parent via ref
    useImperativeHandle(ref, () => ({ saveTab, updateTab }));

    console.log("mode", mode);

    // ── Get company and auth info from localStorage ──
    const company_pk = localStorage.getItem("selected_company_id") ?? ("" as string);
    const access_token = localStorage.getItem("access_token");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    // ── Field definitions and types ──
    interface FieldValues {
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
    }

    type FieldKey = keyof FieldValues;
    type FieldErrors = Record<FieldKey, string>;
    type FieldPlaceholders = Partial<Record<FieldKey, string>>;
    type FieldTooltips = FieldErrors;
    type FieldTypes = FieldErrors;
    type FieldTitles = FieldErrors;
    type requiredFields = Record<FieldKey, boolean>;

    // ── State for all fields and errors ──
    const [fieldValues, setFieldValues] = useState<FieldValues>({
      name: "",
      description: "",
      manufacturer_name: "",
      manufacturer_country: "",
      manufacturer_city: "",
      manufacturer_street: "",
      manufacturer_zip_code: "",
      year_of_construction: "",
      family: "",
      sku: "",
      reference_impact_unit: "",
      pcf_calculation_method: "",
      is_public: false,
    });

    // Errors from server: fieldName → error message
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
      name: "",
      description: "",
      manufacturer_name: "",
      manufacturer_country: "",
      manufacturer_city: "",
      manufacturer_street: "",
      manufacturer_zip_code: "",
      year_of_construction: "",
      family: "",
      sku: "",
      reference_impact_unit: "",
      pcf_calculation_method: "",
      is_public: "",
    });

    // ── Field rendering helpers (placeholders, tooltips, etc.) ──
    const placeholderTexts: FieldPlaceholders = {
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

    const tooltipTexts: FieldTooltips = {
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
    };

    const fieldTypes: FieldTypes = {
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
    };

    const fieldTitles: FieldTitles = {
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
    };

    const requiredFields: requiredFields = {
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
    };

    // ── Fetch product data if editing ──
    useEffect(() => {
      fetchProductData(productId).then(responseOk => {
        if (responseOk) {
          console.log("Product data fetched successfully", productId);
        }
      });
    }, [productId]);

    // ── Fetch product data from API ──
    const fetchProductData = async (productId: string): Promise<boolean> => {
      try {
        const res = await fetch(API_URL + `/companies/${company_pk}/products/${productId}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setFieldValues(data);
          return true;
        } else {
          console.log("Failed to fetch product data", res.status);
          return false;
        }
      } catch (err) {
        console.error("Network error", err);
        return false;
      }
    };

    // ── Handle field value changes ──
    const handleFieldChange = <K extends FieldKey>(name: K, value: FieldValues[K]): void => {
      setFieldValues(d => ({
        ...d,
        [name]: value,
      }));
      // clear previous error for this field, or set error if field is empty
      setFieldErrors(e => ({
        ...e,
        [name]:
          value === "" || value === null || value === undefined ? "Please enter the value" : "",
      }));
      onFieldChange();
    };

    // ── Save new product to server ──
    const saveTab = async (): Promise<string> => {
      try {
        const res = await fetch(API_URL + `/companies/${company_pk}/products/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(fieldValues),
        });
        if (res.ok) {
          // save the product id for the next tab
          const data = await res.json();

          setProductId(data.id.toString());

          return "";
        }
        if (res.status === 400) {
          // new payload shape: { type, errors: [ { attr, detail, … } ] }
          const payload: {
            type: string;
            errors: Array<{ attr: string; detail: string }>;
          } = await res.json();

          const flat: Partial<FieldErrors> = {};
          let formError = "";

          payload.errors.forEach(({ attr, detail }) => {
            if (attr === "non_field_errors") {
              formError = detail;
            } else {
              flat[attr as FieldKey] = detail;
            }
          });

          setFieldErrors(prev => ({ ...prev, ...flat }));
          // return the non_field_errors if present, otherwise fallback
          return formError || "Please fix the errors in the form.";
        }
        console.error("Unexpected status", res.status);
        return "An unexpected error occurred. Please try again.";
      } catch (err) {
        console.error("Network error", err);
        return "A network error occurred. Please try again.";
      }
    };

    // ── Update existing product on server ──
    const updateTab = async (): Promise<string> => {
      try {
        const res = await fetch(API_URL + `/companies/${company_pk}/products/${productId}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(fieldValues),
        });
        if (res.ok) {
          // save the product id for the next tab
          const data = await res.json();

          return "";
        }
        if (res.status === 400) {
          // new payload shape: { type, errors: [ { attr, detail, … } ] }
          const payload: {
            type: string;
            errors: Array<{ attr: string; detail: string }>;
          } = await res.json();

          const flat: Partial<FieldErrors> = {};
          payload.errors.forEach(({ attr, detail }) => {
            flat[attr as FieldKey] = detail;
          });

          setFieldErrors(prev => ({ ...prev, ...flat }));
          return "Please fix the errors in the form.";
        }
        console.error("Unexpected status", res.status);
        return "An unexpected error occurred. Please try again.";
      } catch (err) {
        console.error("Network error", err);
        return "A network error occurred. Please try again.";
      }
    };

    // ── List of all field keys ──
    const fieldKeys = Object.keys(fieldValues) as Array<keyof FieldValues>;

    // ── Helper function to render a specific field ──
    function renderField(fieldKey: FieldKey) {
      const common = {
        name: String(fieldKey),
        tooltip: tooltipTexts[fieldKey],
        required: requiredFields[fieldKey],
        label: fieldTitles[fieldKey],
        error: fieldErrors[fieldKey],
      };

      switch (fieldTypes[fieldKey]) {
        case "radio":
          return (
            <RadioField
              key={fieldKey}
              {...common}
              value={fieldValues[fieldKey] as boolean}
              options={[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ]}
              onFieldChange={(val: boolean) =>
                handleFieldChange(fieldKey, val as FieldValues[typeof fieldKey])
              }
            />
          );
        case "dropdown":
          return (
            <DropdownField
              key={fieldKey}
              {...common}
              value={fieldValues[fieldKey] as string}
              placeholder={placeholderTexts[fieldKey] ?? ""}
              apiUrl={API_URL}
              companyId={company_pk}
              onFieldChange={(val: string) =>
                handleFieldChange(fieldKey, val as FieldValues[typeof fieldKey])
              }
            />
          );
        case "textarea":
          return (
            <TextareaField
              key={fieldKey}
              {...common}
              value={fieldValues[fieldKey] as string}
              placeholder={placeholderTexts[fieldKey] ?? ""}
              onFieldChange={(val: string) =>
                handleFieldChange(fieldKey, val as FieldValues[typeof fieldKey])
              }
            />
          );

        default:
          return (
            <TextField
              key={fieldKey}
              {...common}
              required={requiredFields[fieldKey]}
              value={fieldValues[fieldKey] as string}
              placeholder={placeholderTexts[fieldKey] ?? ""}
              tooltip={tooltipTexts[fieldKey] ?? ""}
              onFieldChange={(val: string) =>
                handleFieldChange(fieldKey, val as FieldValues[typeof fieldKey])
              }
            />
          );
      }
    }

    // ── Render the form layout ──
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {/* Left Column */}
        <div className="space-y-8 md:border-r md:border-gray-200 dark:md:border-gray-700 md:pr-8 md:mr-0">
          <Fieldset className="space-y-6">
            <Legend className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 w-full mb-4">
              Product Details
            </Legend>
            {renderField("name")}
            {renderField("description")}
            {renderField("family")}
            {renderField("sku")}
            {renderField("is_public")}
          </Fieldset>

          <Fieldset className="space-y-6">
            <Legend className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 w-full mb-4">
              Technical Specifications
            </Legend>
            {renderField("reference_impact_unit")}
            {renderField("pcf_calculation_method")}
          </Fieldset>
        </div>

        {/* Right Column */}
        <div>
          <Fieldset className="space-y-6">
            <Legend className="text-lg font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 w-full mb-4">
              Manufacturer Information
            </Legend>
            {renderField("manufacturer_name")}
            {renderField("manufacturer_country")}
            {renderField("manufacturer_city")}
            {renderField("manufacturer_street")}
            {renderField("manufacturer_zip_code")}
            {renderField("year_of_construction")}
          </Fieldset>
        </div>
      </div>
    );
  }
);

ProductInfo.displayName = "ProductInfo";
export default ProductInfo;
