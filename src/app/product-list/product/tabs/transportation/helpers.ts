import { TransportEmission } from "@/lib/api/transportEmissionApi";
import { LineItem } from "@/lib/api/bomApi";
import { FormData } from "./types";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import * as apiCalls from "@/app/product-list/product/tabs/transportation/api-calls";
import { LifecycleStageChoice } from "@/lib/api";

// Opens the modal dialog for adding or editing a transport emission
// When an emission is provided, pre-fills the form for editing
// When no emission is provided, prepares an empty form for a new entry
// Also refreshes reference data needed for the form
export const handleOpenModal = (
  setCurrentEmission: (a: TransportEmission | null) => void,
  setFormData: (a: FormData) => void,
  company_pk: number,
  productId: () => number,
  setBomLineItems: (a: LineItem[]) => void,
  setLifecycleChoices: (a: LifecycleStageChoice[]) => void,
  setReferences: (a: EmissionReference[]) => void,
  setIsModalOpen: (a: boolean) => void,
  emission?: TransportEmission | null
) => {
  // If an emission is provided, we're editing an existing emission
  if (emission) {
    // Set the current emission being edited
    setCurrentEmission(emission);
    // Populate form with existing emission data
    setFormData({
      // Convert numeric values to strings for form inputs
      distance: emission.distance.toString(),
      weight: emission.weight.toString(),
      // Ensure reference is converted to string for form selection
      reference: Number(emission.reference).toString(),
      // Map override factors from API format to form format
      // Add default values of 0 for any missing emission factors
      override_factors:
        emission.override_factors?.map(f => ({
          id: f.id,
          lifecycle_stage: f.lifecycle_stage,
          co_2_emission_factor_biogenic: f.co_2_emission_factor_biogenic ?? 0,
          co_2_emission_factor_non_biogenic: f.co_2_emission_factor_non_biogenic ?? 0,
        })) ?? [],
      // Include associated line items if any exist
      line_items: emission.line_items ?? [],
    });
  } else {
    // Add a new emission, so reset form state
    setCurrentEmission(null);
    // Initialize empty form data
    setFormData({
      distance: "",
      weight: "",
      reference: "",
      override_factors: [],
      line_items: [],
    });
  }
  // Refresh reference data for dropdowns and selections
  // This ensures we have the latest data from the backend
  apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
  apiCalls.fetchLifecycleChoices(company_pk, productId, setLifecycleChoices);
  apiCalls.fetchReferences(setReferences);
  // Display the modal dialog
  setIsModalOpen(true);
};

export const handleCloseModal = (
  setIsModalOpen: (a: boolean) => void,
  setCurrentEmission: (a: TransportEmission | null) => void
) => {
  // Hide the modal dialog
  setIsModalOpen(false);
  // Clear the currently selected emission
  setCurrentEmission(null);
};

// Calculates the sum of biogenic and non-biogenic emission factors
// from an emission's reference details
// Returns the total emission factor per unit (typically per kg-km)
export const sumBioAndNonBioEmissions = (emission: TransportEmission): number => {
  // Check if emission has reference details with emission factors
  // Return 0 if no reference details or emission factors are available
  if (!emission.reference_details || !emission.reference_details.emission_factors) {
    return 0;
  }
    // Sum all emission factors (biogenic + non-biogenic) from all factors in the reference
  return emission.reference_details.emission_factors.reduce((total, factor) => {
    // Handle biogenic emissions, defaulting to 0 if not a valid number
    const biogenic = Number.isFinite(factor.co_2_emission_factor_biogenic)
      ? Number(factor.co_2_emission_factor_biogenic)
      : 0;
    // Handle non-biogenic emissions, defaulting to 0 if not a valid number
    const non_biogenic = Number.isFinite(factor.co_2_emission_factor_non_biogenic)
      ? Number(factor.co_2_emission_factor_non_biogenic)
      : 0;
    // Add both types to the total
    return total + biogenic + non_biogenic;
  }, 0);
};

// Computes the total emissions for a transport emission
// Uses override factors if present, otherwise calculates based on reference factors
// Takes into account distance, weight, and emission factors
export const computeTotalEmissions = (emission: TransportEmission): number => {
  // Check if custom override factors exist
  if (emission.override_factors && emission.override_factors.length > 0) {
    // If override factors are present, use those instead of reference factors
    // Sum the biogenic and non-biogenic components from all override factors
    return emission.override_factors.reduce((total, factor) => {
      // Use nullish coalescing to default to 0 for missing values
      const biogenic = factor.co_2_emission_factor_biogenic ?? 0;
      const nonBiogenic = factor.co_2_emission_factor_non_biogenic ?? 0;
      // Add both types to the running total
      return total + biogenic + nonBiogenic;
    }, 0);
  } else {
    // No overrides, so use reference emission factors
    // Get the sum of emission factors from the reference
    const emissionFactor = sumBioAndNonBioEmissions(emission);
    // Calculate total emissions using the formula: distance * weight * emission factor
    return emission.distance * emission.weight * emissionFactor;
  }
};

// Initiates the delete confirmation flow for a transport emission
// Sets up the deletion ID and shows the confirmation modal
export const handleConfirmDelete = (
  setDeletingEmissionId: (a: number | null) => void,
  setIsDeleteModalOpen: (a: boolean) => void,
  emissionId: number
) => {
  // Store the ID of the emission to be deleted
  setDeletingEmissionId(emissionId);
  // Show the delete confirmation modal
  setIsDeleteModalOpen(true);
};

// Validates if the current form data is complete and valid
// Returns true if any required fields are missing or invalid
// Used to disable the save button when form is incomplete
export const formIncomplete = (formData: FormData): boolean =>
  // Check if distance is empty
  !formData.distance.trim() ||
   // Check if weight is empty
  !formData.weight.trim() ||
  // Check if reference is selected
  !formData.reference ||
  // Check if any override factors are incomplete or invalid
  formData.override_factors.some(
    f =>
      // Missing lifecycle stage
      !f.lifecycle_stage ||
      // Invalid biogenic emission factor
      isNaN(Number(f.co_2_emission_factor_biogenic)) ||
      // Invalid non-biogenic emission factor
      isNaN(Number(f.co_2_emission_factor_non_biogenic))
  );
