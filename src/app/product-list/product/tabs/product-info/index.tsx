"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { DataPassedToTabs, TabHandle } from "../../page";
import RadioField from "../components/RadioField";
import TextField from "../components/TextField";
import { Fieldset, Legend } from "@headlessui/react";
import DropdownField from "../components/DropdownField";
import TextareaField from "../components/TextareaField";
import * as apiCalls from "./api-calls";
import * as Helpers from "./helpers";
import {
  FieldValues,
  FieldKey,
  FieldErrors,
  requiredFields,
  fieldTitles,
  fieldTypes,
  placeholderTexts,
  tooltipTexts,
} from "./types";
import OverrideModal, { FormDataWithOverrideFactors } from "../components/OverrideModal";
import { LifecycleStageChoice, OverrideFactor } from "@/lib/api";

// ── ProductInfo Tab: Handles product details form and API integration ──
const Index = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId, tabKey, mode, setProductId, onFieldChange }, ref) => {
    const [lifecycleChoices, setLifecycleChoices] = useState<LifecycleStageChoice[]>([]);

    // Define updateTab function
    const updateTab = async (): Promise<string> => {
      return apiCalls.updateTab(
        API_URL,
        company_pk,
        productId,
        access_token,
        fieldValues,
        setFieldErrors
      );
    };

    // Define saveTab function
    const saveTab = async (): Promise<string> => {
      return apiCalls.saveTab(
        API_URL,
        company_pk,
        access_token,
        fieldValues,
        setFieldErrors,
        setProductId
      );
    };

    // Expose saveTab and updateTab to parent via ref
    useImperativeHandle(ref, () => ({ saveTab, updateTab }));

    console.log("mode", mode);

    // ── Get company and auth info from localStorage ──
    const company_pk = localStorage.getItem("selected_company_id") ?? ("" as string);
    const access_token = localStorage.getItem("access_token");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
      override_factors: [],
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
      override_factors: "",
    });

    useEffect(() => {
      apiCalls
        .fetchLifecycleStageOptions(API_URL, company_pk)
        .then(data => setLifecycleChoices(data))
        .catch(() => setLifecycleChoices([])); // handle errors if needed
    }, []);

    // ── Fetch product data if editing ──
    useEffect(() => {
      apiCalls
        .fetchProductData(API_URL, company_pk, access_token, setFieldValues, productId)
        .then(responseOk => {
          if (responseOk) {
            console.log("Product data fetched successfully", productId);
          }
        });
    }, [productId]);

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
                Helpers.handleFieldChange(
                  fieldKey,
                  val as FieldValues[typeof fieldKey],
                  setFieldValues,
                  setFieldErrors,
                  onFieldChange
                )
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
                Helpers.handleFieldChange(
                  fieldKey,
                  val as FieldValues[typeof fieldKey],
                  setFieldValues,
                  setFieldErrors,
                  onFieldChange
                )
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
                Helpers.handleFieldChange(
                  fieldKey,
                  val as FieldValues[typeof fieldKey],
                  setFieldValues,
                  setFieldErrors,
                  onFieldChange
                )
              }
            />
          );
        case "override-factors-modal":
          return (
            <OverrideModal
              formData={fieldValues}
              setFormData={setFieldValues as (a: FormDataWithOverrideFactors) => void}
              lifecycleChoices={lifecycleChoices}
              onFieldChange={(val: OverrideFactor[]) =>
                Helpers.handleFieldChange(
                  fieldKey,
                  val as FieldValues[typeof fieldKey],
                  setFieldValues,
                  setFieldErrors,
                  onFieldChange
                )
              }
              renderField={renderField}
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
                Helpers.handleFieldChange(
                  fieldKey,
                  val as FieldValues[typeof fieldKey],
                  setFieldValues,
                  setFieldErrors,
                  onFieldChange
                )
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
            <Legend className="pt-6 text-lg font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 w-full mb-4">
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
            {renderField("override_factors")}
          </Fieldset>
        </div>

        {/* Right Column */}
        <div>
          <Fieldset className="space-y-6">
            <Legend className="pt-6 text-lg font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 w-full mb-4">
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

Index.displayName = "ProductInfo";
export default Index;
