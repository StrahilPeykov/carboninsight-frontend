import { LifecycleStage } from "@/lib/api";
import { FormDataWithOverrideFactors } from "../components/OverrideModal";

// Add override factor
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

// Update override fields
export const handleOverrideFactorChange = (
  formData: FormDataWithOverrideFactors,
  setFormData: (a: FormDataWithOverrideFactors) => void,
  index: number,
  field: "lifecycle_stage" | "biogenic" | "non_biogenic",
  raw: string //  the string from the <input>
) => {
  const updated = [...formData.override_factors];

  switch (field) {
    case "lifecycle_stage":
      updated[index].lifecycle_stage = raw as LifecycleStage;
      break;

    case "biogenic":
      updated[index].co_2_emission_factor_biogenic = raw.trim() === "" ? undefined : Number(raw);
      break;

    case "non_biogenic":
      updated[index].co_2_emission_factor_non_biogenic =
        raw.trim() === "" ? undefined : Number(raw);
      break;
  }

  setFormData({ ...formData, override_factors: updated });
};

// Remove override factor
export const handleRemoveOverrideFactor = (
  formData: FormDataWithOverrideFactors,
  setFormData: (a: FormDataWithOverrideFactors) => void,
  index: number
) => {
  const updated = [...formData.override_factors];
  updated.splice(index, 1);
  setFormData({
    ...formData,
    override_factors: updated,
  });
};

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
