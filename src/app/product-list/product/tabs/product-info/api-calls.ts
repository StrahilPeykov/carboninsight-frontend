import {
  FieldKey,
  FieldValues,
  FieldErrors,
  tooltipTexts,
  requiredFields,
  fieldTitles,
  fieldTypes,
  placeholderTexts,
} from "./types";
import RadioField from "@/app/product-list/product/tabs/components/RadioField";
import DropdownField from "@/app/product-list/product/tabs/components/DropdownField";
import { LifecycleStageChoice } from "@/lib/api";

//───────────────────────────────────────────────────────────────
//Product Tab API Utilities
//
//This module provides functions for handling product data via
//API interactions within the product tab of the application UI.
//
//Included functions:
//- fetchProductData: Retrieve existing product data by ID
//- updateTab: Submit updated product info via PUT
//- saveTab: Create a new product record via POST
//- fetchLifecycleStageOptions: Load dropdown options for overrides
//
//Dependencies:
//- Form type definitions (FieldValues, FieldErrors, etc.)
//- Dropdown/Radio field components
//- API metadata types
//───────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Fetch detailed product information by ID for initial form load
// ─────────────────────────────────────────────────────────────
export const fetchProductData = async (
  API_URL: string,
  company_pk: string,
  access_token: string | null,
  setFieldValues: (a: FieldValues) => void,
  productId: string
): Promise<boolean> => {
  try {
    const res = await fetch(API_URL + `/companies/${company_pk}/products/${productId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (res.ok) {
      // Parse and apply the returned product data to the form fields
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

// ─────────────────────────────────────────────────────────────
// Update product data on the server using PUT
// Returns error messages if any validation fails
// ─────────────────────────────────────────────────────────────
export const updateTab = async (
  API_URL: string,
  company_pk: string,
  productId: string,
  access_token: string | null,
  fieldValues: FieldValues,
  setFieldErrors: (a: FieldErrors | ((prev: FieldErrors) => FieldErrors)) => void
): Promise<string> => {
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

// ─────────────────────────────────────────────────────────────
// Create a new product entry on the server using POST
// Stores the new product ID and handles form-level validation
// ─────────────────────────────────────────────────────────────
export const saveTab = async (
  API_URL: string,
  company_pk: string,
  access_token: string | null,
  fieldValues: FieldValues,
  setFieldErrors: (a: FieldErrors | ((prev: FieldErrors) => FieldErrors)) => void,
  setProductId: (id: string) => void
): Promise<string> => {
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

// ─────────────────────────────────────────────────────────────
// Fetch the lifecycle stage options for dropdown input fields
// Uses the OPTIONS method to retrieve metadata about the API
// ─────────────────────────────────────────────────────────────
export const fetchLifecycleStageOptions = async (
  apiUrl: string,
  companyId: string
): Promise<LifecycleStageChoice[]> => {
  try {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) {
      throw new Error("No access token found");
    }
    // Fetch OPTIONS for the products endpoint to get choices for the field
    const res = await fetch(`${apiUrl}/companies/${companyId}/products/`, {
      method: "OPTIONS",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    // Log raw choices data for debugging purposes
    console.log(
      "Lifecycle stage options data:",
      data.actions?.POST?.override_factors.child?.children?.lifecycle_stage?.choices
    );
    const choices = data.actions?.POST?.override_factors.child?.children?.lifecycle_stage?.choices;
    if (Array.isArray(choices)) {
      return choices.map(
        (choice: any): LifecycleStageChoice => ({
          value: choice.value,
          display_name: choice.display_name ?? choice.display ?? String(choice.value),
        })
      );
    }
    return [];
  } catch (err) {
    console.error("Error fetching options:", err);
    return [];
  }
};
