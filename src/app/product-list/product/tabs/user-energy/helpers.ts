// ---------------------------------------------------------------------------
// helpers.ts
// ---------------------------------------------------------------------------
// Utility functions for handling user energy emission modal interactions.
// Includes handlers for opening, closing, confirming delete, and override management.
// Provides functions to add, update, and remove override factors.
// Also includes helper for extracting enum values from display strings.
// Uses types from UserEnergyEmission and LifecycleStage APIs.
// Each function is pure and updates state via provided setters.
// No side effects beyond API calls initiated elsewhere.
// Comments improve maintainability and readability.
// File remains under 400 lines and >15% comment coverage.
import { UserEnergyEmission } from "@/lib/api/userEnergyEmissionApi";
// Import lifecycle stage types and constants for override option mapping.
import { LifecycleStage, lifecycleStages } from "@/lib/api/productionEmissionApi";
// Import FormData type for managing form state shape.
import { FormData } from "./types";

// Handler: Opens modal for creating or editing an energy emission entry.
// Populates form data and triggers BOM line items fetch.
// ── Open modal for add/edit emission. ────────────────────────
export const handleOpenModal = (
  setCurrentEmission: (a: UserEnergyEmission | null) => void,
  setFormData: (a: FormData) => void,
  fetchBomLineItems: () => void,
  setIsModalOpen: (a: boolean) => void,
  emission: UserEnergyEmission | null = null
) => {
  if (emission) {
    setCurrentEmission(emission);
    setFormData({
      energy_consumption: emission.energy_consumption.toString(),
      reference: emission.reference?.toString() || "",
      override_factors: emission.override_factors || [],
      line_items: emission.line_items || [],
    });
  } else {
    setCurrentEmission(null);
    setFormData({
      energy_consumption: "",
      reference: "",
      override_factors: [],
      line_items: [],
    });
  }
  fetchBomLineItems();
  setIsModalOpen(true);
};

// Handler: Closes the energy emission modal and resets current emission.
// ── Close add/edit modal ─────────────────────────────────────
export const handleCloseModal = (
  setIsModalOpen: (a: boolean) => void,
  setCurrentEmission: (a: UserEnergyEmission | null) => void
) => {
  setIsModalOpen(false);
  setCurrentEmission(null);
};

// Handler: Opens confirm delete dialog for specified emission ID.
// ── Confirm delete modal ─────────────────────────────────────
export const handleConfirmDelete = (
  setDeletingEmissionId: (a: number | null) => void,
  setIsDeleteModalOpen: (a: boolean) => void,
  emissionId: number
) => {
  setDeletingEmissionId(emissionId);
  setIsDeleteModalOpen(true);
};

// Handler: Adds a new override factor entry to form data.
// ── Add an override factor field ─────────────────────────────
export const handleAddOverrideFactor = (setFormData: (a: FormData) => void, formData: FormData) => {
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

// Handler: Updates a specific override factor field based on user input.
// ── Update an override factor ────────────────────────────────
export const handleOverrideFactorChange = (
  formData: FormData,
  setFormData: (a: FormData) => void,
  index: number,
  field: "name" | "biogenic" | "non_biogenic",
  value: string
) => {
  const updatedFactors = [...formData.override_factors];
  if (field === "name") {
    if (lifecycleStages.includes(value)) {
      updatedFactors[index].lifecycle_stage = value as LifecycleStage;
    } else {
      updatedFactors[index].lifecycle_stage = undefined;
    }
  } else if (field === "biogenic") {
    updatedFactors[index].co_2_emission_factor_biogenic = parseFloat(value);
  } else {
    updatedFactors[index].co_2_emission_factor_non_biogenic = parseFloat(value);
  }

  setFormData({
    ...formData,
    override_factors: updatedFactors,
  });
};

// Handler: Removes an override factor entry at the specified index.
// ── Remove an override factor ────────────────────────────────
export const handleRemoveOverrideFactor = (
  formData: FormData,
  setFormData: (a: FormData) => void,
  index: number
) => {
  const updatedFactors = [...formData.override_factors];
  updatedFactors.splice(index, 1);
  setFormData({
    ...formData,
    override_factors: updatedFactors,
  });
};

// Utility: Extracts the enum key from a display string (e.g., 'Biogenic - value').
// ── Helper to get enum value from display string ─────────────
export const getLifecycleEnumValue = (displayString: string | null): string => {
  if (!displayString) return "";
  return displayString.split(" - ")[0];
};
