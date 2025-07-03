// Utility functions module for production energy emission management
// Provides helper functions for modal operations, form state management, and data manipulation
// Centralized business logic for emission form workflows and lifecycle stage handling

// Production energy emission API types and lifecycle stage enumerations
// LifecycleStage defines valid emission calculation phases (cradle-to-gate, etc.)
// lifecycleStages provides validation array for user input
// ProductionEnergyEmission represents complete emission record structure
import {
  LifecycleStage,
  lifecycleStages,
  ProductionEnergyEmission,
} from "@/lib/api/productionEmissionApi";
// Bill of Materials line item type for component-level energy attribution
import { LineItem } from "@/lib/api/bomApi";
// Local form data interface for type-safe form state management
import { FormData } from "./types";
// API calls module for data fetching and BOM item retrieval
import * as apiCalls from "./api-calls";

// Comprehensive modal opening handler for both create and edit workflows
// Handles form initialization, data population, and BOM item loading
// Determines operation mode based on emission parameter presence
// ── Open modal for add/edit emission ────────────────────────
export const handleOpenModal = (
  setCurrentEmission: (a: ProductionEnergyEmission | null) => void,
  setFormData: (a: FormData) => void,
  company_pk: number,
  productId: () => number,
  setBomLineItems: (a: LineItem[]) => void,
  setIsModalOpen: (a: boolean) => void,
  emission?: ProductionEnergyEmission | null
) => {
  // Edit mode: populate form with existing emission data
  // Convert numeric values to strings for form input compatibility
  if (emission) {
    setCurrentEmission(emission);
    setFormData({
      energy_consumption: emission.energy_consumption.toString(),
      reference: emission.reference?.toString() || "",
      override_factors: emission.override_factors || [],
      line_items: emission.line_items || [],
    });
  } else {
    // Create mode: initialize form with empty default values
    // Ensures clean state for new emission creation
    setCurrentEmission(null);
    setFormData({
      energy_consumption: "",
      reference: "",
      override_factors: [],
      line_items: [],
    });
  }
  // Load BOM items for component association regardless of mode
  // Enables energy attribution to specific material components
  apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
  setIsModalOpen(true);
};

// Modal closing handler with complete state cleanup
// Ensures proper modal dismissal and prevents data leakage between sessions
// ── Close add/edit modal ─────────────────────────────────────
export const handleCloseModal = (
  setIsModalOpen: (a: boolean) => void,
  setCurrentEmission: (a: ProductionEnergyEmission | null) => void
) => {
  // Hide modal and clear current emission to reset form state
  setIsModalOpen(false);
  setCurrentEmission(null);
};

// Deletion confirmation modal initialization
// Sets up deletion target and displays confirmation dialog for safety
// ── Confirm delete modal ─────────────────────────────────────
export const handleConfirmDelete = (
  setDeletingEmissionId: (a: number | null) => void,
  setIsDeleteModalOpen: (a: boolean) => void,
  emissionId: number
) => {
  // Store emission ID for deletion and show confirmation modal
  // Prevents accidental deletions through explicit confirmation step
  setDeletingEmissionId(emissionId);
  setIsDeleteModalOpen(true);
};

// Override factor addition function for custom emission calculations
// Creates new override factor with default values for user customization
// Enables deviation from standard emission reference databases when needed
// ── Add an override factor field ─────────────────────────────
export const handleAddOverrideFactor = (setFormData: (a: FormData) => void, formData: FormData) => {
  // Add new override factor with default values to form state
  // lifecycle_stage undefined allows user to select appropriate stage
  // Default emission factors of 1 provide neutral starting point
  setFormData({
    ...formData,
    override_factors: [
      ...formData.override_factors,
      {
        lifecycle_stage: undefined,
        co_2_emission_factor_biogenic: 1,
        co_2_emission_factor_non_biogenic: 1,
      },
    ],
  });
};

// Override factor modification handler with field-specific validation
// Processes updates to lifecycle stage selection and emission factor values
// Ensures data integrity and type safety for carbon footprint calculations
// ── Update an override factor ────────────────────────────────
export const handleOverrideFactorChange = (
  formData: FormData,
  setFormData: (a: FormData) => void,
  index: number,
  field: "name" | "biogenic" | "non_biogenic",
  value: string
) => {
  // Create immutable copy of override factors array for safe manipulation
  const updatedFactors = [...formData.override_factors];
  
  if (field === "name") {
    // Validate lifecycle stage against known enum values
    // Sets undefined for invalid selections to prevent data corruption
    if (lifecycleStages.includes(value)) {
      updatedFactors[index].lifecycle_stage = value as LifecycleStage;
    } else {
      updatedFactors[index].lifecycle_stage = undefined;
    }
  } else if (field === "biogenic") {
    // Parse and update biogenic CO2 emission factor
    // Handles string-to-number conversion for form input compatibility
    updatedFactors[index].co_2_emission_factor_biogenic = parseFloat(value);
  } else {
    // Parse and update non-biogenic CO2 emission factor
    // Ensures numeric values for accurate calculation processing
    updatedFactors[index].co_2_emission_factor_non_biogenic = parseFloat(value);
  }

  // Update form state with modified override factors array
  setFormData({
    ...formData,
    override_factors: updatedFactors,
  });
};

// Override factor removal function with array index management
// Safely removes override factor while maintaining array integrity
// ── Remove an override factor ────────────────────────────────
export const handleRemoveOverrideFactor = (
  formData: FormData,
  setFormData: (a: FormData) => void,
  index: number
) => {
  // Create immutable copy and remove factor at specified index
  // splice() modifies array in-place to remove single element
  const updatedFactors = [...formData.override_factors];
  updatedFactors.splice(index, 1);
  setFormData({
    ...formData,
    override_factors: updatedFactors,
  });
};

// String parsing utility for lifecycle stage enum extraction
// Handles display format conversion to backend enum values
// ── Helper to get enum value from display string ─────────────
export const getLifecycleEnumValue = (displayString: string | null): string => {
  // Return empty string for null/undefined input to prevent errors
  if (!displayString) return "";
  // Extract enum value from "ENUM - Description" format strings
  // Enables user-friendly display while maintaining data integrity
  return displayString.split(" - ")[0];
};
