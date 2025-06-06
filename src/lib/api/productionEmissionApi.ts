import { apiRequest } from "./apiClient";
import { EmissionReference } from "./emissionReferenceApi";

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

export const lifecycleStages = [
  "A1",
  "A2",
  "A3",
  "A4",
  "A5",
  "A1-A3",
  "A4-A5",
  "B1",
  "B2",
  "B3",
  "B4",
  "B5",
  "B6",
  "B7",
  "B1-B7",
  "C1",
  "C2",
  "C3",
  "C4",
  "C1-C4",
  "C2-C4",
  "D",
  "Other",
];

export interface OverrideFactor {
  id?: number;
  lifecycle_stage?: LifecycleStage;
  co_2_emission_factor_biogenic?: number;
  co_2_emission_factor_non_biogenic?: number;
}

export interface ProductionEnergyEmission {
  id: number;
  energy_consumption: number;
  reference?: number | null;
  reference_details?: EmissionReference;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

export interface CreateProductionEnergyEmissionRequest {
  energy_consumption: number;
  reference?: number | null;
  override_factors?: OverrideFactor[];
  line_items?: number[];
}

export const productionEnergyApi = {
  getAllProductionEmissions: async (
    companyId: number,
    productId: number
  ): Promise<ProductionEnergyEmission[]> => {
    return apiRequest<ProductionEnergyEmission[]>(
      `/companies/${companyId}/products/${productId}/emissions/production_energy/`
    );
  },

  getProductionEmission: async (
    companyId: number,
    productId: number,
    emissionId: number
  ): Promise<ProductionEnergyEmission> => {
    return apiRequest<ProductionEnergyEmission>(
      `/companies/${companyId}/products/${productId}/production_energy/${emissionId}/`
    );
  },
  createProductionEmission: async (
    companyId: number,
    productId: number,
    data: CreateProductionEnergyEmissionRequest
  ): Promise<ProductionEnergyEmission> => {
    return apiRequest<ProductionEnergyEmission, Partial<CreateProductionEnergyEmissionRequest>>(
      `/companies/${companyId}/products/${productId}/emissions/production_energy/`,
      {
        method: "POST",
        body: data,
      }
    );
  },

  updateProductionEmission: async (
    companyId: number,
    productId: number,
    emissionId: number,
    data: Partial<CreateProductionEnergyEmissionRequest>
  ): Promise<ProductionEnergyEmission> => {
    return apiRequest<ProductionEnergyEmission, Partial<CreateProductionEnergyEmissionRequest>>(
      `/companies/${companyId}/products/${productId}/emissions/production_energy/${emissionId}/`,
      {
        method: "PATCH",
        body: data,
      }
    );
  },

  deleteProductionEmission: async (
    companyId: number,
    productId: number,
    emissionId: number
  ): Promise<void> => {
    return apiRequest<void>(
      `/companies/${companyId}/products/${productId}/emissions/production_energy/${emissionId}/`,
      { method: "DELETE" }
    );
  },
};
