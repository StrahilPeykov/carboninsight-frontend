import { apiRequest } from "./apiClient";

export type LifecycleStage =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "A5"
  | "A1-A3"
  | "A4-A5"
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "B5"
  | "B6"
  | "B7"
  | "B1-B7"
  | "C1"
  | "C2"
  | "C3"
  | "C4"
  | "C1-C4"
  | "C2-C4"
  | "D"
  | "Other";

export interface OverrideFactor {
  id: number;
  lifecycle_stage: LifecycleStage;
  co_2_emission_factor: number;
}

export interface MaterialEmission {
  id: number;
  weight: number;
  reference: number;
  override_factors: OverrideFactor[];
  line_items: number[];
}

export interface CreateMaterialEmission {
  weight: number;
  reference: number;
  override_factors: OverrideFactor[];
}

export interface UpdateMaterialEmission {
  weight?: number;
  reference?: number;
  override_factors?: OverrideFactor[];
}

export const materialEmissionApi = {
  getAllMaterialEmissions: (company_id: number, product_id: number) =>
    apiRequest<MaterialEmission[]>(
      `/companies/${company_id}/products/${product_id}/emissions/material/`,
      {
        method: "GET",
      }
    ),

  createMaterialEmission: (company_id: number, product_id: number, data: CreateMaterialEmission) =>
    apiRequest<MaterialEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/material/`,
      {
        method: "POST",
        body: data as unknown as Record<string, unknown>,
      }
    ),

  getMaterialEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest<MaterialEmission>(
      `/companies/${company_id}/products/${product_id}/emissions/material/${emission_id}/`,
      {
        method: "GET",
      }
    ),

  updateMaterialEmission: (
    company_id: number,
    product_id: number,
    emission_id: number,
    data: UpdateMaterialEmission
  ) => {
    if (
      data.weight !== undefined &&
      data.reference !== undefined &&
      data.override_factors !== undefined
    ) {
      return apiRequest(
        `/companies/${company_id}/products/${product_id}/emissions/material/${emission_id}/`,
        {
          method: "PUT",
          body: data as unknown as Record<string, unknown>,
        }
      );
    } else {
      return apiRequest(
        `/companies/${company_id}/products/${product_id}/emissions/material/${emission_id}/`,
        {
          method: "PATCH",
          body: data as unknown as Record<string, unknown>,
        }
      );
    }
  },

  deleteMaterialEmission: (company_id: number, product_id: number, emission_id: number) =>
    apiRequest(
      `/companies/${company_id}/products/${product_id}/emissions/material/${emission_id}/`,
      {
        method: "DELETE",
      }
    ),
};
