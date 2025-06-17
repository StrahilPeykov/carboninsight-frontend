import { TransportEmission } from "@/lib/api/transportEmissionApi";
import { LineItem } from "@/lib/api/bomApi";
import { FormData } from "./types";
import { EmissionReference } from "@/lib/api/emissionReferenceApi";
import * as apiCalls from "@/app/product-list/product/tabs/transportation/api-calls";
import { LifecycleStageChoice } from "@/lib/api";
import { FormDataWithOverrideFactors } from "../components/OverrideModal";

// Handle open modal for add/edit
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
  if (emission) {
    setCurrentEmission(emission);
    setFormData({
      distance: emission.distance.toString(),
      weight: emission.weight.toString(),
      reference: Number(emission.reference).toString(),
      override_factors:
        emission.override_factors?.map(f => ({
          id: f.id,
          lifecycle_stage: f.lifecycle_stage,
          co_2_emission_factor_biogenic: f.co_2_emission_factor_biogenic ?? 0,
          co_2_emission_factor_non_biogenic: f.co_2_emission_factor_non_biogenic ?? 0,
        })) ?? [],
      line_items: emission.line_items ?? [],
    });
  } else {
    // Add new
    setCurrentEmission(null);
    setFormData({
      distance: "",
      weight: "",
      reference: "",
      override_factors: [],
      line_items: [],
    });
  }
  // Refresh BOM and lifecycle choices
  apiCalls.fetchBomLineItems(company_pk, productId, setBomLineItems);
  apiCalls.fetchLifecycleChoices(company_pk, productId, setLifecycleChoices);
  apiCalls.fetchReferences(setReferences);
  setIsModalOpen(true);
};

export const handleCloseModal = (
  setIsModalOpen: (a: boolean) => void,
  setCurrentEmission: (a: TransportEmission | null) => void
) => {
  setIsModalOpen(false);
  setCurrentEmission(null);
};

// Sum total emission factor for an emission
export const sumBioAndNonBioEmissions = (emission: TransportEmission): number => {
  if (!emission.reference_details || !emission.reference_details.emission_factors) {
    return 0;
  }
  return emission.reference_details.emission_factors.reduce((total, factor) => {
    const biogenic = Number.isFinite(factor.co_2_emission_factor_biogenic)
      ? Number(factor.co_2_emission_factor_biogenic)
      : 0;
    const non_biogenic = Number.isFinite(factor.co_2_emission_factor_non_biogenic)
      ? Number(factor.co_2_emission_factor_non_biogenic)
      : 0;
    return total + biogenic + non_biogenic;
  }, 0);
};

export const computeTotalEmissions = (emission: TransportEmission): number => {
  if (emission.override_factors && emission.override_factors.length > 0) {
    return emission.override_factors.reduce((total, factor) => {
      const biogenic = factor.co_2_emission_factor_biogenic ?? 0;
      const nonBiogenic = factor.co_2_emission_factor_non_biogenic ?? 0;
      return total + biogenic + nonBiogenic;
    }, 0);
  } else {
    const emissionFactor = sumBioAndNonBioEmissions(emission);
    return emission.distance * emission.weight * emissionFactor;
  }
};

// Delete confirmation
export const handleConfirmDelete = (
  setDeletingEmissionId: (a: number | null) => void,
  setIsDeleteModalOpen: (a: boolean) => void,
  emissionId: number
) => {
  setDeletingEmissionId(emissionId);
  setIsDeleteModalOpen(true);
};

// Computed boolean to disable Save button
export const formIncomplete = (formData: FormData): boolean =>
  !formData.distance.trim() ||
  !formData.weight.trim() ||
  !formData.reference ||
  formData.override_factors.some(
    f =>
      !f.lifecycle_stage ||
      isNaN(Number(f.co_2_emission_factor_biogenic)) ||
      isNaN(Number(f.co_2_emission_factor_non_biogenic))
  );

// const sumOverrideEmissions = (emission: TransportEmission): number => {
//   if (!emission.override_factors || emission.override_factors.length === 0) {
//     return 0;
//   }
//
//   return emission.override_factors.reduce((total, factor) => {
//     const biogenic = factor.co_2_emission_factor_biogenic ?? 0;
//     const nonBiogenic = factor.co_2_emission_factor_non_biogenic ?? 0;
//     return total + biogenic + nonBiogenic;
//   }, 0);
// };
