// Import necessary types for working with lifecycle stages and form data
import { LifecycleStage } from "@/lib/api";
import { FormDataWithOverrideFactors } from "../components/OverrideModal";

// Function to add a new override factor to the form data
// Creates a new override factor with default values and appends it to the existing array
// This creates a new entry with empty/default values that the user can then fill in
export const handleAddOverrideFactor = (
  setFormData: (a: FormDataWithOverrideFactors) => void,
  formData: FormDataWithOverrideFactors
) => {
  setFormData({
    ...formData,
    override_factors: [
      ...formData.override_factors,
      {
        lifecycle_stage: "" as LifecycleStage,
        co_2_emission_factor_biogenic: 0,
        co_2_emission_factor_non_biogenic: 0,
      },
    ],
  });
};

// Function to update a specific field in an override factor
// Handles different field types with appropriate type conversions
// Maintains all other form data while only updating the specified field
export const handleOverrideFactorChange = (
  formData: FormDataWithOverrideFactors,
  setFormData: (a: FormDataWithOverrideFactors) => void,
  index: number,
  field: "lifecycle_stage" | "biogenic" | "non_biogenic",
  raw: string //  the string from the <input>
) => {
  // Create a copy of the override factors array to avoid direct state mutation
  const updated = [...formData.override_factors];

  // Handle different field types with appropriate conversions
  switch (field) {
    case "lifecycle_stage":
      // Set the lifecycle stage directly from the input string
      updated[index].lifecycle_stage = raw as LifecycleStage;
      break;

    case "biogenic":
      // Convert input to number or undefined if empty
      // This allows for clearing the field
      updated[index].co_2_emission_factor_biogenic = raw.trim() === "" ? undefined : Number(raw);
      break;

    case "non_biogenic":
      // Convert input to number or undefined if empty
      // This allows for clearing the field
      updated[index].co_2_emission_factor_non_biogenic =
        raw.trim() === "" ? undefined : Number(raw);
      break;
  }

  // Update the form data with the modified override factors
  setFormData({ ...formData, override_factors: updated });
};

// Function to remove an override factor from the form
// Takes the index of the factor to remove and splices it from the array
// Returns an updated form data object with the factor removed
export const handleRemoveOverrideFactor = (
  formData: FormDataWithOverrideFactors,
  setFormData: (a: FormDataWithOverrideFactors) => void,
  index: number
) => {
  // Create a copy of the override factors array
  const updated = [...formData.override_factors];
  
  // Remove the factor at the specified index
  updated.splice(index, 1);
  
  // Update the form data with the modified array
  setFormData({
    ...formData,
    override_factors: updated,
  });
};

