"use client"; // Enables client-side rendering in Next.js

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

// ── UI Components & Icons ──
import Button from "@/app/components/ui/Button";
import { Plus, X } from "lucide-react";

// ── Types and Form Metadata ──
import { DataPassedToTabs, TabHandle } from "../../page";

// ── Custom Form Fields ──
import RadioField from "../components/RadioField";
import TextField from "../components/TextField";
import { Fieldset, Legend, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import DropdownField from "../components/DropdownField";
import TextareaField from "../components/TextareaField";

// ── API & Helper Modules ──
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

//──────────────────────────────────────────────────────────────────────────────────────────────────
//Product Info Form Component (Index)
//
//Description:
//This React component is responsible for rendering and managing the product information form,
//used in a multi-tabbed product editor. It supports both "create" and "edit" modes, depending
//on whether a `productId` is passed.
//
//Key Features:
//- Renders structured form fields using a mix of reusable components (TextField, RadioField, etc.)
//- Manages form state (`fieldValues`) and validation errors (`fieldErrors`)
//- Fetches lifecycle stage dropdown options from API on mount
//- If editing an existing product, fetches existing product data
//- Uses `forwardRef` to expose `saveTab` and `updateTab` handlers to parent components
//- Supports a modal interface for override emissions data entry
//
//Structure:
//- Left Column: Product Details and Technical Specifications
//- Right Column: Manufacturer Information
//
//Dependencies:
//- Uses Headless UI, Lucide icons, and internal UI components
//- API calls and helper functions abstracted in separate modules
//
//Exposed Methods (via `ref`):
//- `saveTab()`: POST form data to create a product
//- `updateTab()`: PUT form data to update an existing product
//──────────────────────────────────────────────────────────────────────────────────────────────────


// ── ProductInfo Tab ──
//// Handles rendering, data loading, and saving for the Product Info tab
const Index = forwardRef<TabHandle, DataPassedToTabs>(
  ({ productId, tabKey, mode, setProductId, onFieldChange }, ref) => {
    // ── Dropdown override options ──
    const [lifecycleChoices, setLifecycleChoices] = useState<LifecycleStageChoice[]>([]);

    // ── Handles updating product info if editing ──
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

    // ── Handles saving a new product entry ──
    // This function sends a POST request with form data to the backend
    // It uses auth and company context from localStorage and sets errors or product ID accordingly
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

    // Make saveTab and updateTab available to parent components via ref
    useImperativeHandle(ref, () => ({ saveTab, updateTab }));

    console.log("mode", mode);

    // ── Get company and auth info from localStorage ──
    const company_pk = localStorage.getItem("selected_company_id") ?? ("" as string);
    const access_token = localStorage.getItem("access_token");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    // ── Modal open/close state ──
    const [isModalOpen, setIsModalOpen] = useState(false);

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
      pcf_calculation_method: "ISO 14040/14044",
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

    // Fetch lifecycle stage options for emissions override modal on initial mount
    useEffect(() => {
      apiCalls
        .fetchLifecycleStageOptions(API_URL, company_pk)
        .then(data => setLifecycleChoices(data))
        .catch(() => setLifecycleChoices([])); // handle errors if needed
    }, []);

    // Load existing product data when productId is present (edit mode)
    useEffect(() => {
      if (productId && productId.trim() !== "") {
        apiCalls
          .fetchProductData(API_URL, company_pk, access_token, setFieldValues, productId)
          .then(responseOk => {
            if (responseOk) {
              console.log("Product data fetched successfully", productId);
            }
          });
      }
    }, [productId]);

    // ── List of all field keys ──
    const fieldKeys = Object.keys(fieldValues) as Array<keyof FieldValues>;

    // Render appropriate input field based on field type metadata
    function renderField(fieldKey: FieldKey) {
      const common = {
        name: String(fieldKey),
        tooltip: tooltipTexts[fieldKey],
        required: requiredFields[fieldKey],
        label: fieldTitles[fieldKey],
        error: fieldErrors[fieldKey],
      };

      switch (fieldTypes[fieldKey]) {
        // Render a boolean radio group
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
        // Render a dropdown field
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
        // Render a multiline textarea
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
        // Render override modal for emissions adjustment
        case "override-factors-modal":
          return (
            <>
              <div className="mt-6">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2"
                  variant={fieldValues.override_factors.length === 0 ? "primary" : "outline"}
                >
                  {fieldValues.override_factors.length === 0 ? (
                    <>
                      <Plus className="w-4 h-4" /> Add product emissions override
                    </>
                  ) : (
                    <>
                      Edit {fieldValues.override_factors.length} emissions
                    </>
                  )}
                </Button>
              </div>
              {/* ── Modal to edit override emissions ── */}
                    <Dialog
                      open={isModalOpen}
                      as="div"
                      className="fixed inset-0 overflow-y-auto pt-12 z-20"
                      onClose={() => setIsModalOpen(false)}
                    >
                      <div className="min-h-screen px-4 text-center">
                        <div className="fixed inset-0 bg-black/50" />
                        <span className="inline-block h-screen align-middle" aria-hidden="true">
                          &#8203;
                        </span>
                        <DialogPanel className="relative inline-block w-full max-w-lg p-6 my-8 overflow-visible text-left align-middle bg-white dark:bg-gray-800 shadow-xl rounded-lg z-30">
                          <div className="flex justify-between items-center mb-4">
                            <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
                              Override product emissions
                            </DialogTitle>
                            <button
                              onClick={() => setIsModalOpen(false)}
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
                              aria-label="Close modal"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
              <OverrideModal
                formData={fieldValues}
                setFormData={setFieldValues as (a: FormDataWithOverrideFactors) => void}
                lifecycleChoices={lifecycleChoices}
                isModalOpen={isModalOpen} // Pass modal state
                setIsModalOpen={setIsModalOpen} // Pass setter function
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
                        </DialogPanel>
        </div>
      </Dialog>
            </>
          );
        // Render standard text input
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

    // ── Form Layout: Split into left and right columns ──
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {/* ── Left Column - Product Details & Technical Specs ─  */}
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

        {/* ── Right Column ─ Manufacturer Information ── */}
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
