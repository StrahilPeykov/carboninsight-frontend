import {
  LifecycleStage,
  lifecycleStages,
  ProductionEnergyEmission,
} from "@/lib/api/productionEmissionApi";
import { LineItem } from "@/lib/api/bomApi";
import { FormData } from "./types";
import * as apiCalls from "./api-calls";

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
  apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
  setIsModalOpen(true);
};

// ── Close add/edit modal ─────────────────────────────────────
export const handleCloseModal = (
  setIsModalOpen: (a: boolean) => void,
  setCurrentEmission: (a: ProductionEnergyEmission | null) => void
) => {
  setIsModalOpen(false);
  setCurrentEmission(null);
};

// ── Confirm delete modal ─────────────────────────────────────
export const handleConfirmDelete = (
  setDeletingEmissionId: (a: number | null) => void,
  setIsDeleteModalOpen: (a: boolean) => void,
  emissionId: number
) => {
  setDeletingEmissionId(emissionId);
  setIsDeleteModalOpen(true);
};

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

// ── Helper to get enum value from display string ─────────────
export const getLifecycleEnumValue = (displayString: string | null): string => {
  if (!displayString) return "";
  return displayString.split(" - ")[0];
};
