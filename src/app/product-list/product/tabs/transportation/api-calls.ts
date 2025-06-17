import {
  CreateTransportEmission,
  TransportEmission,
  transportEmissionApi,
} from "@/lib/api/transportEmissionApi";
import { bomApi, LineItem } from "@/lib/api/bomApi";
import { LifecycleStageChoice } from "@/lib/api";
import { EmissionReference, emissionReferenceApi } from "@/lib/api/emissionReferenceApi";
import { FormData } from "./types";

// Fetch all transport emissions
export const fetchEmissions = async (
  setIsLoading: (a: boolean) => void,
  company_pk: number,
  productId: () => number,
  setEmissions: (a: TransportEmission[]) => void
) => {
  setIsLoading(true);
  try {
    const data = await transportEmissionApi.getAllTransportEmissions(company_pk, productId());
    setEmissions(data);
  } catch (error) {
    console.error("Error fetching transport emissions:", error);
  } finally {
    setIsLoading(false);
  }
};

// Fetch BOM line items
export const fetchBomLineItems = async (
  company_pk: number,
  productId: () => number,
  setBomLineItems: (a: LineItem[]) => void
) => {
  try {
    const data = await bomApi.getAllLineItems(company_pk, productId());
    setBomLineItems(data);
  } catch (error) {
    console.error("Error fetching BOM items:", error);
  }
};

// Fetch lifecycle stage choices
export const fetchLifecycleChoices = async (
  company_pk: number,
  productId: () => number,
  setLifecycleChoices: (a: LifecycleStageChoice[]) => void
) => {
  try {
    const schema = (await transportEmissionApi.getTransportEmissionOptions(
      company_pk,
      productId()
    )) as {
      actions: {
        POST: {
          override_factors?: {
            child?: {
              children?: {
                lifecycle_stage?: {
                  choices: { value: string; display_name: string }[];
                };
              };
            };
          };
        };
      };
    };
    const choices =
      schema.actions.POST.override_factors?.child?.children?.lifecycle_stage?.choices ?? [];
    setLifecycleChoices(choices);
  } catch (error) {
    console.error("Error fetching lifecycle stage choices:", error);
  }
};

// Fetch reference emission factors
export const fetchReferences = async (setReferences: (a: EmissionReference[]) => void) => {
  try {
    const data = await emissionReferenceApi.getAllTransportReferences();
    setReferences(data);
  } catch (error) {
    console.error("Error fetching transport references:", error);
  }
};

// Submit add or update
export const handleSubmit = async (
  formData: FormData,
  setIsSubmitting: (a: boolean) => void,
  currentEmission: TransportEmission | null,
  company_pk: number,
  productId: () => number,
  setIsLoading: (a: boolean) => void,
  setEmissions: (a: TransportEmission[]) => void,
  setIsModalOpen: (a: boolean) => void,
  onFieldChange: () => void
) => {
  const distanceNum = parseFloat(formData.distance);
  const weightNum = parseFloat(formData.weight);
  if (isNaN(distanceNum) || distanceNum <= 0) {
    alert("Please enter a valid distance (greater than 0).");
    return;
  }
  if (isNaN(weightNum) || weightNum <= 0) {
    alert("Please enter a valid weight (greater than 0).");
    return;
  }
  if (
    formData.override_factors.some(
      factor =>
        !factor.lifecycle_stage ||
        typeof factor.co_2_emission_factor_biogenic !== "number" ||
        isNaN(factor.co_2_emission_factor_biogenic) ||
        typeof factor.co_2_emission_factor_non_biogenic !== "number" ||
        isNaN(factor.co_2_emission_factor_non_biogenic)
    )
  ) {
    alert("Please fill in all override fields correctly.");
    return;
  }

  setIsSubmitting(true);
  try {
    const referenceId = formData.reference ? parseInt(formData.reference, 10) : 0;
    const payloadBase = {
      distance: distanceNum,
      weight: weightNum,
      reference: referenceId,
      override_factors: formData.override_factors.map(f =>
        f.id
          ? {
              id: f.id,
              lifecycle_stage: f.lifecycle_stage,
              co_2_emission_factor_biogenic: f.co_2_emission_factor_biogenic,
              co_2_emission_factor_non_biogenic: f.co_2_emission_factor_non_biogenic,
            }
          : {
              lifecycle_stage: f.lifecycle_stage,
              co_2_emission_factor_biogenic: f.co_2_emission_factor_biogenic,
              co_2_emission_factor_non_biogenic: f.co_2_emission_factor_non_biogenic,
            }
      ),
      line_items: formData.line_items.length ? formData.line_items : undefined,
    } as CreateTransportEmission & { override_factors: any[]; line_items?: number[] };

    if (currentEmission) {
      // Update existing
      await transportEmissionApi.updateTransportEmission(
        company_pk,
        productId(),
        currentEmission.id,
        payloadBase
      );
    } else {
      // Create new
      await transportEmissionApi.createTransportEmission(company_pk, productId(), payloadBase);
    }

    // Refresh list and close modal
    await fetchEmissions(setIsLoading, company_pk, productId, setEmissions);
    setIsModalOpen(false);
    onFieldChange();
  } catch (error) {
    console.error("Error saving transport emission:", error);
  } finally {
    setIsSubmitting(false);
  }
};

export const handleDelete = async (
  deletingEmissionId: number | null,
  company_pk: number,
  productId: () => number,
  setEmissions: (a: TransportEmission[]) => void,
  emissions: TransportEmission[],
  setIsDeleteModalOpen: (a: boolean) => void,
  onFieldChange: () => void
) => {
  if (deletingEmissionId === null) return;
  try {
    await transportEmissionApi.deleteTransportEmission(company_pk, productId(), deletingEmissionId);
    setEmissions(emissions.filter(e => e.id !== deletingEmissionId));
    setIsDeleteModalOpen(false);
    onFieldChange();
  } catch (error) {
    console.error("Error deleting transport emission:", error);
  }
};
